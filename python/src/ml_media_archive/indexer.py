#!/usr/bin/env python3
"""
ML Media Archive Indexer -- Python implementation.

This is a self-contained, command-line port of the HTML+JavaScript indexer that
lives in ``web/src/main/webapp/`` (indexer.js / index.html). It produces the same
self-contained, searchable HTML archive: a single ``*_media_archive.html`` file
with a ``sourceData = [...]`` JSON array embedded inside the AG-Grid based viewer.

The program walks a folder of photos and videos and, for every supported file,
computes:

  * a SHA-256 checksum of the raw bytes,
  * a small base64 JPEG preview,
  * EXIF / video metadata (camera, date taken, GPS) and the closest cities,
  * object detection with one or more ML models
        - DETR-ResNet-50            (90 COCO classes)
        - OWL-ViT base patch32      (1203 LVIS classes, zero-shot)
  * an image description with Florence-2 (photos only),
  * OCR text with Tesseract.

Like the JavaScript version it uses Hugging Face transformers. It runs on the
GPU automatically when a CUDA device is available and falls back to the CPU
otherwise (controlled with ``--device``, default ``auto``).

Every option that the web UI exposes as a form control is available here as a
command-line parameter with the same default value. With no arguments the
program behaves like the web app started with its default settings.

The cities database, the OWL-ViT label definitions and the final HTML viewer
template are all embedded in this single file (see the EMBEDDED DATA section at
the bottom), so no companion files are required at runtime.
"""

from __future__ import annotations

import argparse
import base64
import datetime as _dt
import gzip
import hashlib
import io
import json
import logging
import math
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# Third-party imports are deferred (imported lazily inside the functions that
# need them) so that ``--help`` and argument parsing work even before the heavy
# ML stack is installed.

__version__ = "3.0.0"

NOT_AVAILABLE = "N/A"
FILE_PROCESSING_STATUS_SUCCESS = "Success"

# Mirrors the constants at the top of indexer.js.
MAX_IMAGE_SIZE_FOR_OBJ_DETECTION = 2560
MAX_IMAGE_SIZE_FOR_OCR = 1280
PREVIEW_SIZE = 150
EARTH_RADIUS_KM = 6371

# Model identifiers. The web app loads the Xenova/onnx-community ONNX exports
# through transformers.js; the Python port loads the equivalent original models
# from the Hugging Face hub through the `transformers` library. The ``name``
# values are kept identical to the JS app because they are written verbatim into
# the ``modelName`` field of every detection in the output.
MODEL_DETR = "Xenova_detr-resnet-50"
MODEL_OWLVIT = "Xenova_owlvit-base-patch32"
MODEL_FLORENCE = "onnx-community_Florence-2-base"

HF_DETR = "facebook/detr-resnet-50"
HF_OWLVIT = "google/owlvit-base-patch32"
HF_FLORENCE = "microsoft/Florence-2-base"

ALL_MODEL_NAMES = [MODEL_DETR, MODEL_OWLVIT, MODEL_FLORENCE]

# Tesseract language list, in the same order the web UI lists them.
SUPPORTED_LANGUAGES = [
    ("eng", "English"), ("cmn", "Mandarin Chinese"), ("hin", "Hindi"),
    ("spa", "Spanish"), ("ara", "Arabic"), ("fra", "French"),
    ("ben", "Bengali"), ("por", "Portuguese"), ("rus", "Russian"),
    ("urd", "Urdu"), ("ind", "Indonesian"), ("deu", "German"),
    ("jpn", "Japanese"), ("ita", "Italian"), ("nld", "Dutch"),
]

IMAGE_MIME_TYPES = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".gif": "image/gif", ".bmp": "image/bmp", ".webp": "image/webp",
}
VIDEO_MIME_TYPES = {
    ".mp4": "video/mp4", ".mov": "video/quicktime",
}

logger = logging.getLogger("ml_media_archive")


# ---------------------------------------------------------------------------
# Device selection (GPU when available, CPU otherwise)
# ---------------------------------------------------------------------------
def _gpu_unavailable_hint(torch_module) -> str:
    """Explain why the GPU is not being used and how to enable it."""
    cpu_only = False
    try:
        cpu_only = torch_module is not None and torch_module.version.cuda is None
    except Exception:
        cpu_only = False
    if cpu_only:
        ver = getattr(torch_module, "__version__", "?")
        return (f"The installed PyTorch is a CPU-only build (torch {ver}); it cannot "
                f"use a GPU. To use your GPU, reinstall a CUDA build of torch, e.g.: "
                f"pip uninstall -y torch torchvision && pip install torch torchvision "
                f"--index-url https://download.pytorch.org/whl/cu128 "
                f"(see https://pytorch.org/get-started/locally/ for the right CUDA version).")
    return ("No CUDA-capable GPU is visible to PyTorch (check your NVIDIA driver / CUDA "
            "install; see https://pytorch.org/get-started/locally/).")


def _gpu_arch_supported(torch_module) -> bool:
    """Whether the installed PyTorch has GPU kernels for the detected GPU.

    ``cuda.is_available()`` returns True for *any* detected GPU, even one whose
    compute capability is newer than every architecture the installed build was
    compiled for. Such a GPU then dies on the first kernel launch with "no kernel
    image is available for execution on the device" -- e.g. a Blackwell ``sm_120``
    GPU on the cu124 wheels, which only go up to ``sm_90``. Mirror PyTorch's own
    capability check: the build supports the GPU only when it was compiled for the
    same CUDA major architecture, so we can fall back to CPU with a clear message
    instead of crashing on every file.
    """
    try:
        majors = set()
        for arch in torch_module.cuda.get_arch_list():
            if arch.startswith("sm_"):
                digits = "".join(c for c in arch[3:] if c.isdigit())
                if digits:
                    majors.add(int(digits) // 10)
        if not majors:
            return True  # cannot determine -- assume usable
        major, _minor = torch_module.cuda.get_device_capability(0)
        return major in majors
    except Exception:
        return True  # be permissive if introspection fails


def _gpu_arch_mismatch_hint(torch_module) -> str:
    """Explain that the detected GPU is too new for the installed PyTorch build."""
    try:
        name = torch_module.cuda.get_device_name(0)
    except Exception:
        name = "The detected GPU"
    try:
        major, minor = torch_module.cuda.get_device_capability(0)
        cap = f"sm_{major}{minor}"
    except Exception:
        cap = "its compute capability"
    try:
        built = ", ".join(torch_module.cuda.get_arch_list()) or "an older architecture set"
    except Exception:
        built = "an older architecture set"
    ver = getattr(torch_module, "__version__", "?")
    return (f"{name} ({cap}) is newer than the installed PyTorch (torch {ver}, built for "
            f"{built}); it has no matching GPU kernels. Reinstall a build that supports "
            f"{cap}: pip uninstall -y torch torchvision && pip install torch torchvision "
            f"--index-url https://download.pytorch.org/whl/cu128 "
            f"(CUDA 12.8 covers Blackwell sm_120 and newer; see "
            f"https://pytorch.org/get-started/locally/).")


def resolve_device(requested: str = "auto") -> str:
    """Resolve the torch device string.

    ``auto`` (the default) picks ``cuda`` when a usable GPU is available and
    ``cpu`` otherwise -- the same behaviour as the JavaScript app, which tries
    WebGPU first and falls back to WASM. An explicit ``cpu`` / ``cuda`` is
    honoured, except that ``cuda`` falls back to ``cpu`` (with a clear warning)
    when no usable GPU is available, so the run does not crash.

    A GPU counts as usable only when the installed PyTorch was actually compiled
    for its architecture; a GPU newer than the build (e.g. Blackwell on the cu124
    wheels) is detected by ``cuda.is_available()`` but fails on every kernel
    launch, so it is treated as "no GPU" and reported with how to fix it.
    """
    requested = (requested or "auto").lower()
    try:
        import torch
        cuda_ok = bool(torch.cuda.is_available())
    except Exception:
        torch = None
        cuda_ok = False

    if requested == "cpu":
        return "cpu"

    if cuda_ok and not _gpu_arch_supported(torch):
        hint = _gpu_arch_mismatch_hint(torch)
        if requested == "cuda":
            logger.warning("GPU was requested (--device cuda) but %s Falling back to CPU.", hint)
        else:
            logger.warning("A GPU was detected but %s Using CPU instead.", hint)
        return "cpu"

    if requested == "cuda":
        if cuda_ok:
            return "cuda"
        logger.warning("GPU was requested (--device cuda) but is not available. %s "
                       "Falling back to CPU.", _gpu_unavailable_hint(torch))
        return "cpu"
    # auto
    if cuda_ok:
        return "cuda"
    logger.info("Using CPU (no GPU available to PyTorch). %s", _gpu_unavailable_hint(torch))
    return "cpu"


# ---------------------------------------------------------------------------
# Embedded-data access
# ---------------------------------------------------------------------------
# The actual blobs live at the very bottom of the file in the EMBEDDED DATA
# section. During development they may be empty, in which case the loaders fall
# back to reading the slim data files from a directory given by
# ``MEDIA_ARCHIVE_DATA_DIR`` (default: ./_data next to this script). The shipped,
# self-contained ``indexer.py`` carries the data inline and needs no fallback.

_cities_cache: Optional[List[list]] = None
_owlvit_labels_cache: Optional[List[list]] = None
_final_html_cache: Optional[str] = None


def _dev_data_dir() -> Path:
    return Path(os.environ.get("MEDIA_ARCHIVE_DATA_DIR", Path(__file__).resolve().parent / "_data"))


def _decode_gz_b64(blob: str) -> bytes:
    return gzip.decompress(base64.b64decode(blob))


def load_cities() -> List[list]:
    """Return the cities database as a list of [name, altname, lat, lon, cc, country]."""
    global _cities_cache
    if _cities_cache is not None:
        return _cities_cache
    if CITIES_GZ_B64:
        _cities_cache = json.loads(_decode_gz_b64(CITIES_GZ_B64).decode("utf-8"))
    else:
        path = _dev_data_dir() / "cities_slim.json"
        _cities_cache = json.loads(path.read_text(encoding="utf-8"))
    logger.info("Loaded %d cities", len(_cities_cache))
    return _cities_cache


def load_owlvit_labels() -> List[list]:
    """Return OWL-ViT label definitions as a list of [name, definition, synonyms]."""
    global _owlvit_labels_cache
    if _owlvit_labels_cache is not None:
        return _owlvit_labels_cache
    if OWLVIT_LABELS_GZ_B64:
        _owlvit_labels_cache = json.loads(_decode_gz_b64(OWLVIT_LABELS_GZ_B64).decode("utf-8"))
    else:
        path = _dev_data_dir() / "owlvit_slim.json"
        _owlvit_labels_cache = json.loads(path.read_text(encoding="utf-8"))
    logger.info("Loaded %d OWL-ViT labels", len(_owlvit_labels_cache))
    return _owlvit_labels_cache


def load_final_html() -> str:
    """Return the final HTML viewer template containing the {source_data} placeholder."""
    global _final_html_cache
    if _final_html_cache is not None:
        return _final_html_cache
    if FINAL_HTML_GZ_B64:
        _final_html_cache = _decode_gz_b64(FINAL_HTML_GZ_B64).decode("utf-8")
    else:
        path = _dev_data_dir() / "final_html.txt"
        _final_html_cache = path.read_text(encoding="utf-8")
    return _final_html_cache


# ---------------------------------------------------------------------------
# Small helpers (ports of the corresponding indexer.js functions)
# ---------------------------------------------------------------------------
def change_double_precision(value: float, digits: int) -> float:
    """Equivalent of JS ``parseFloat(value.toFixed(digits))`` -- drops trailing zeros."""
    return float(f"{value:.{digits}f}")


def to_fixed_number(value: float, digits: int) -> float:
    """Equivalent of JS ``+value.toFixed(digits)`` / ``Number(value.toFixed(digits))``."""
    return float(f"{value:.{digits}f}")


def format_bytes(num_bytes: int) -> str:
    if num_bytes == 0:
        return "0 Bytes"
    sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    i = int(math.floor(math.log(num_bytes) / math.log(1024)))
    value = num_bytes / math.pow(1024, i)
    return f"{value:.2f} {sizes[i]}"


def get_file_checksum(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def js_date_iso(dt: _dt.datetime) -> str:
    """Format a datetime the way ``JSON.stringify(new Date(...))`` does (UTC, ms, Z)."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=_dt.timezone.utc)
    dt = dt.astimezone(_dt.timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{dt.microsecond // 1000:03d}Z"


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    to_rad = math.radians
    d_lat = to_rad(lat2 - lat1)
    d_lon = to_rad(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2
         + math.cos(to_rad(lat1)) * math.cos(to_rad(lat2)) * math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c


def find_closest_cities(target_lat: float, target_lon: float,
                        count: int = 3, degree_range: int = 5) -> List[dict]:
    """Port of findClosestCities: filter by lon +/- range, sort by haversine, top N."""
    cities = load_cities()
    lon_min = target_lon - degree_range
    lon_max = target_lon + degree_range
    result = []
    for name, altname, lat, lon, cc, country in cities:
        if lon_min <= lon <= lon_max:
            dist = change_double_precision(haversine(target_lat, target_lon, lat, lon), 3)
            result.append((dist, name, altname, lat, lon, cc, country))
    result.sort(key=lambda r: r[0])
    out = []
    for dist, name, altname, lat, lon, cc, country in result[:count]:
        out.append({
            "name": name,
            "altname": altname,
            "lat": lat,
            "lon": lon,
            "country_code": cc,
            "country_name": country,
            "distance": dist,
        })
    return out


def extract_coordinates(text: Optional[str]) -> Tuple[Optional[float], Optional[float]]:
    """Port of extractCoordinates: parse 'lat lon' style strings from video metadata."""
    if not text:
        return None, None
    matches = [m for m in re.finditer(r"([+-]?\d+(?:\.\d+)?)(?:[^0-9]?([NSEW]))?", text, re.I)
               if m.group(1)]
    if len(matches) < 2:
        return None, None

    def parse(m: "re.Match[str]") -> float:
        num = float(m.group(1))
        direction = m.group(2).upper() if m.group(2) else None
        if direction:
            num = abs(num)
            if direction in ("S", "W"):
                num = -num
        return num

    return parse(matches[0]), parse(matches[1])


# ---------------------------------------------------------------------------
# EXIF handling for images
# ---------------------------------------------------------------------------
def _dms_to_decimal(dms, ref: Optional[str]) -> Any:
    """Convert EXIF GPS (degrees, minutes, seconds) rationals to a signed decimal."""
    try:
        deg, minute, sec = [float(x) for x in dms]
    except (TypeError, ValueError):
        return ""
    if deg == 0 and minute == 0 and sec == 0:
        # JS dmsToDecimal returns "" when any component is falsy.
        return ""
    value = deg + (minute / 60.0) + (sec / 3600.0)
    if ref in ("S", "W"):
        value = -value
    return value


def extract_image_exif(path: Path) -> dict:
    """Extract EXIF data from an image, mirroring extractExifData() in indexer.js."""
    from PIL import Image, ExifTags

    exif_out = {
        "cameraManufacturer": NOT_AVAILABLE,
        "cameraModel": NOT_AVAILABLE,
        "dateTaken": NOT_AVAILABLE,
        "latitude": NOT_AVAILABLE,
        "latitudeRef": NOT_AVAILABLE,
        "longitude": NOT_AVAILABLE,
        "longitudeRef": NOT_AVAILABLE,
        "altitude": NOT_AVAILABLE,
        "altitudeRef": NOT_AVAILABLE,
        "exposureTime": NOT_AVAILABLE,
        "isoSpeed": NOT_AVAILABLE,
        "aperture": NOT_AVAILABLE,
        "focalLength": NOT_AVAILABLE,
        # Always a list (never "N/A"): the archive viewer calls
        # closestCities.map(...) guarded only by .length, so a string would make
        # the whole grid fail to render. Empty when there is no GPS fix.
        "closestCities": [],
    }
    try:
        img = Image.open(path)
        exif = img.getexif()
    except Exception:
        return exif_out
    if not exif:
        return exif_out

    tag_by_name = {ExifTags.TAGS.get(k, k): v for k, v in exif.items()}
    ifd = {}
    try:
        ifd = exif.get_ifd(ExifTags.IFD.Exif)
    except Exception:
        ifd = {}
    exif_tags = {ExifTags.TAGS.get(k, k): v for k, v in ifd.items()}

    def rat(value):
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    exif_out["cameraManufacturer"] = tag_by_name.get("Make") or NOT_AVAILABLE
    exif_out["cameraModel"] = tag_by_name.get("Model") or NOT_AVAILABLE

    dto = exif_tags.get("DateTimeOriginal") or tag_by_name.get("DateTime")
    if dto:
        parsed = _parse_exif_image_date(str(dto))
        if parsed is not None:
            exif_out["dateTaken"] = parsed

    exposure = rat(exif_tags.get("ExposureTime"))
    if exposure is not None:
        exif_out["exposureTime"] = exposure
    iso = exif_tags.get("ISOSpeedRatings")
    if iso is not None:
        exif_out["isoSpeed"] = int(iso) if not isinstance(iso, (tuple, list)) else int(iso[0])
    fnum = rat(exif_tags.get("FNumber"))
    if fnum is not None:
        exif_out["aperture"] = fnum
    focal = rat(exif_tags.get("FocalLength"))
    if focal is not None:
        exif_out["focalLength"] = focal

    # GPS IFD.
    gps = {}
    try:
        gps_ifd = exif.get_ifd(ExifTags.IFD.GPSInfo)
        gps = {ExifTags.GPSTAGS.get(k, k): v for k, v in gps_ifd.items()}
    except Exception:
        gps = {}

    if gps:
        lat_ref = gps.get("GPSLatitudeRef")
        lon_ref = gps.get("GPSLongitudeRef")
        lat = _dms_to_decimal(gps.get("GPSLatitude"), lat_ref) if gps.get("GPSLatitude") else ""
        lon = _dms_to_decimal(gps.get("GPSLongitude"), lon_ref) if gps.get("GPSLongitude") else ""
        exif_out["latitude"] = lat if lat != "" else NOT_AVAILABLE
        exif_out["latitudeRef"] = lat_ref or NOT_AVAILABLE
        exif_out["longitude"] = lon if lon != "" else NOT_AVAILABLE
        exif_out["longitudeRef"] = lon_ref or NOT_AVAILABLE
        alt = gps.get("GPSAltitude")
        if alt is not None:
            try:
                exif_out["altitude"] = float(alt)
            except (TypeError, ValueError):
                exif_out["altitude"] = NOT_AVAILABLE
        alt_ref = gps.get("GPSAltitudeRef")
        if alt_ref is not None:
            try:
                exif_out["altitudeRef"] = int(alt_ref)
            except (TypeError, ValueError):
                exif_out["altitudeRef"] = NOT_AVAILABLE

        if isinstance(exif_out["latitude"], (int, float)) and isinstance(exif_out["longitude"], (int, float)):
            exif_out["closestCities"] = find_closest_cities(
                exif_out["latitude"], exif_out["longitude"], 3, 5)

    return exif_out


def _parse_exif_image_date(date_string: str):
    """Port of parseExifImageDate: 'YYYY:MM:DD HH:MM:SS' -> local datetime."""
    try:
        date_part, time_part = date_string.strip().split(" ")
        year, month, day = [int(x) for x in date_part.split(":")]
        hours, minutes, seconds = [int(x) for x in time_part.split(":")]
        return _dt.datetime(year, month, day, hours, minutes, seconds)
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Video metadata (ffprobe) -- mirrors parseVideoMetadata()
# ---------------------------------------------------------------------------
def extract_video_metadata(path: Path) -> dict:
    exif_out = {
        "cameraManufacturer": NOT_AVAILABLE,
        "cameraModel": NOT_AVAILABLE,
        "dateTaken": NOT_AVAILABLE,
        "latitude": NOT_AVAILABLE,
        "latitudeRef": NOT_AVAILABLE,
        "longitude": NOT_AVAILABLE,
        "longitudeRef": NOT_AVAILABLE,
        "altitude": NOT_AVAILABLE,
        "altitudeRef": NOT_AVAILABLE,
        "exposureTime": NOT_AVAILABLE,
        "isoSpeed": NOT_AVAILABLE,
        "aperture": NOT_AVAILABLE,
        "focalLength": NOT_AVAILABLE,
        # Always a list (never "N/A"): the archive viewer calls
        # closestCities.map(...) guarded only by .length, so a string would make
        # the whole grid fail to render. Empty when there is no GPS fix.
        "closestCities": [],
    }
    try:
        out = subprocess.check_output(
            ["ffprobe", "-v", "quiet", "-print_format", "json",
             "-show_format", "-show_streams", str(path)],
            stderr=subprocess.STDOUT)
        meta = json.loads(out)
    except Exception as err:
        logger.warning("ffprobe failed for %s: %s", path, err)
        return exif_out

    tags = {}
    fmt = meta.get("format", {})
    tags.update({k.lower(): v for k, v in (fmt.get("tags") or {}).items()})
    for stream in meta.get("streams", []):
        for k, v in (stream.get("tags") or {}).items():
            tags.setdefault(k.lower(), v)

    # Date created.
    creation = tags.get("creation_time") or tags.get("date")
    if creation:
        dt = _parse_iso_datetime(creation)
        if dt is not None:
            exif_out["dateTaken"] = dt

    # Camera make/model. Apple uses com.apple.quicktime.{make,model}; Android
    # stores the model in the 'performer'/'com.android.version' tags.
    make = (tags.get("com.apple.quicktime.make") or tags.get("make")
            or tags.get("encoded_hardware_companyname") or NOT_AVAILABLE)
    model = (tags.get("com.apple.quicktime.model") or tags.get("model")
             or tags.get("performer") or tags.get("encoded_hardware_name") or NOT_AVAILABLE)
    os_version = (tags.get("com.android.version") or NOT_AVAILABLE)
    if make and "apple" not in str(make).lower() and os_version and os_version != NOT_AVAILABLE:
        android = f"Android: {os_version}"
        model = f"{model} {android}" if model and model != NOT_AVAILABLE else android
    exif_out["cameraManufacturer"] = make or NOT_AVAILABLE
    exif_out["cameraModel"] = model or NOT_AVAILABLE

    # GPS.
    gps_str = (tags.get("com.apple.quicktime.location.iso6709")
               or tags.get("location") or tags.get("location-eng")
               or tags.get("xyz"))
    lat, lon = extract_coordinates(gps_str)
    if lat is not None:
        exif_out["latitude"] = lat
    if lon is not None:
        exif_out["longitude"] = lon
    if isinstance(lat, (int, float)) and isinstance(lon, (int, float)):
        exif_out["closestCities"] = find_closest_cities(lat, lon, 3, 5)

    return exif_out


def _parse_iso_datetime(text: str):
    text = text.strip()
    for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ",
                "%Y-%m-%dT%H:%M:%S.%f%z", "%Y-%m-%dT%H:%M:%S%z",
                "%Y-%m-%d %H:%M:%S", "%Y:%m:%d %H:%M:%S"):
        try:
            return _dt.datetime.strptime(text, fmt)
        except ValueError:
            continue
    return None


def get_video_duration_size(path: Path) -> Tuple[float, int, int]:
    """Return (duration_seconds, width, height) for a video using ffprobe."""
    try:
        out = subprocess.check_output(
            ["ffprobe", "-v", "quiet", "-print_format", "json",
             "-show_format", "-show_streams", str(path)],
            stderr=subprocess.STDOUT)
        meta = json.loads(out)
    except Exception:
        return 0.0, 0, 0
    duration = float(meta.get("format", {}).get("duration", 0) or 0)
    width = height = 0
    for stream in meta.get("streams", []):
        if stream.get("codec_type") == "video":
            width = int(stream.get("width", 0) or 0)
            height = int(stream.get("height", 0) or 0)
            if stream.get("duration"):
                try:
                    duration = float(stream["duration"])
                except ValueError:
                    pass
            break
    return duration, width, height


# ---------------------------------------------------------------------------
# Image helpers
# ---------------------------------------------------------------------------
def resize_max_dim(img, max_dimension: int):
    """Resize a PIL image so its largest side equals max_dimension (only if larger)."""
    w, h = img.size
    current_max = max(w, h)
    if max_dimension > 0 and current_max > max_dimension:
        scale = max_dimension / current_max
        new_size = (max(1, round(w * scale)), max(1, round(h * scale)))
        return img.resize(new_size)
    return img


def image_to_jpeg_data_url(img, max_dimension: int = 0) -> Tuple[str, int, int]:
    """Port of convertImageToBase64WithResize: resize and return a JPEG data URL."""
    rgb = img.convert("RGB")
    if max_dimension > 0:
        w, h = rgb.size
        scale = max_dimension / max(w, h)
        if scale < 1:
            rgb = rgb.resize((max(1, int(w * scale)), max(1, int(h * scale))))
    buf = io.BytesIO()
    rgb.save(buf, format="JPEG")
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{b64}", rgb.size[0], rgb.size[1]


# ---------------------------------------------------------------------------
# ML model wrappers
# ---------------------------------------------------------------------------
class ModelRegistry:
    """Lazily loads the selected ML models and runs detection / captioning.

    The models run on ``device`` ("cuda" or "cpu"); pass "auto" to pick the GPU
    when available.
    """

    def __init__(self, selected_models: List[str], device: str = "auto"):
        self.selected = selected_models
        self.device = resolve_device(device)
        logger.info("ModelRegistry using device: %s", self.device)
        self._detr = None
        self._owlvit_model = None
        self._owlvit_processor = None
        self._owlvit_candidates: Optional[List[str]] = None
        self._owlvit_reverse: Optional[Dict[str, str]] = None
        self._florence_model = None
        self._florence_processor = None

    @property
    def _pipeline_device(self) -> int:
        """transformers pipeline device index: 0 for the first GPU, -1 for CPU."""
        return 0 if self.device.startswith("cuda") else -1

    # -- DETR -------------------------------------------------------------
    def _ensure_detr(self):
        if self._detr is None:
            from transformers import pipeline
            logger.info("Loading model %s (%s)", MODEL_DETR, HF_DETR)
            self._detr = pipeline("object-detection", model=HF_DETR, device=self._pipeline_device)

    def detect_detr(self, img, min_prob: float) -> List[dict]:
        self._ensure_detr()
        out = self._detr(img, threshold=min_prob)
        results = []
        for o in out:
            box = o["box"]
            results.append({
                "label": o["label"],
                "score": float(o["score"]),
                "box": {"xmin": box["xmin"], "ymin": box["ymin"],
                        "xmax": box["xmax"], "ymax": box["ymax"]},
            })
        return results

    # -- OWL-ViT ----------------------------------------------------------
    @staticmethod
    def _map_probability_to_threshold(p: float) -> float:
        p = max(0.0, min(1.0, p))
        return 0.45 * p * p + 0.05 * p + 0.02

    @staticmethod
    def _map_threshold_to_probability(t: float) -> float:
        return math.pow(t, 0.45)

    def _enrich_owlvit_labels(self):
        """Port of enrichLabels: build prompt-engineered candidate strings + reverse map."""
        labels = load_owlvit_labels()
        candidate_set: List[str] = []
        seen = set()
        reverse: Dict[str, str] = {}
        for name, definition, synonyms in labels:
            for synonym in synonyms:
                pretty = synonym.replace("_", " ")
                other = ", ".join(s.replace("_", " ") for s in synonyms if s != synonym)
                variants = [
                    f"A photo of a {pretty}, {definition}",
                    f"{pretty} — {definition}",
                    (f"A photo of a {pretty} (also called {other})" if other
                     else f"A photo of a {pretty}"),
                ]
                pretty_name = name.replace("_", " ")
                pretty_name = pretty_name[:1].upper() + pretty_name[1:] if pretty_name else pretty_name
                for variant in variants:
                    if variant not in seen:
                        seen.add(variant)
                        candidate_set.append(variant)
                        reverse[variant] = pretty_name
        self._owlvit_candidates = candidate_set
        self._owlvit_reverse = reverse

    def _ensure_owlvit(self):
        if self._owlvit_model is None:
            from transformers import OwlViTProcessor, OwlViTForObjectDetection
            logger.info("Loading model %s (%s)", MODEL_OWLVIT, HF_OWLVIT)
            self._owlvit_processor = OwlViTProcessor.from_pretrained(HF_OWLVIT)
            self._owlvit_model = OwlViTForObjectDetection.from_pretrained(HF_OWLVIT)
            self._owlvit_model.to(self.device)
            self._owlvit_model.eval()
        if self._owlvit_candidates is None:
            self._enrich_owlvit_labels()

    @staticmethod
    def _check_similar_boxes(b1: dict, b2: dict, tol: float) -> bool:
        return (abs(b1["xmin"] - b2["xmin"]) <= tol and abs(b1["ymin"] - b2["ymin"]) <= tol
                and abs(b1["xmax"] - b2["xmax"]) <= tol and abs(b1["ymax"] - b2["ymax"]) <= tol)

    def _deduplicate_boxes(self, results: List[dict], tol: float) -> List[dict]:
        keep: List[dict] = []
        for item in results:
            similar = False
            for i, kept in enumerate(keep):
                if self._check_similar_boxes(item["box"], kept["box"], tol):
                    similar = True
                    if item["score"] > kept["score"]:
                        keep[i] = item
                    break
            if not similar:
                keep.append(item)
        return keep

    def detect_owlvit(self, img, min_prob: float) -> List[dict]:
        import torch

        self._ensure_owlvit()
        threshold = self._map_probability_to_threshold(min_prob)
        candidates = self._owlvit_candidates or []
        batch_size = 500
        width, height = img.size
        all_results: List[dict] = []
        for start in range(0, len(candidates), batch_size):
            batch = candidates[start:start + batch_size]
            # padding/truncation are required because the candidate prompts have
            # varying token lengths; without them transformers cannot stack them
            # into a single tensor ("Unable to create tensor ...").
            inputs = self._owlvit_processor(text=[batch], images=img, return_tensors="pt",
                                            padding=True, truncation=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            with torch.no_grad():
                outputs = self._owlvit_model(**inputs)
            target_sizes = torch.tensor([[height, width]], device=self.device)
            processed = self._owlvit_processor.post_process_object_detection(
                outputs=outputs, target_sizes=target_sizes, threshold=threshold)[0]
            scores = processed["scores"].tolist()
            labels = processed["labels"].tolist()
            boxes = processed["boxes"].tolist()
            # Keep top_k=15 per batch, mirroring the JS {top_k: 15}.
            triples = sorted(zip(scores, labels, boxes), key=lambda t: t[0], reverse=True)[:15]
            for score, label_idx, box in triples:
                label_text = batch[label_idx]
                all_results.append({
                    "label": label_text,
                    "score": score,
                    "box": {"xmin": box[0], "ymin": box[1], "xmax": box[2], "ymax": box[3]},
                })
        all_results.sort(key=lambda r: r["score"], reverse=True)
        # Map prompt -> friendly label.
        for r in all_results:
            r["label"] = (self._owlvit_reverse or {}).get(r["label"], r["label"])
        deduped = self._deduplicate_boxes(all_results, 20)
        deduped = deduped[:12]
        for r in deduped:
            r["score"] = self._map_threshold_to_probability(r["score"])
        return deduped

    # -- Florence-2 -------------------------------------------------------
    def _ensure_florence(self):
        if self._florence_model is None:
            import torch
            from transformers import AutoModelForCausalLM, AutoProcessor
            logger.info("Loading model %s (%s)", MODEL_FLORENCE, HF_FLORENCE)
            dtype = torch.float16 if self.device.startswith("cuda") else torch.float32
            self._florence_model = AutoModelForCausalLM.from_pretrained(
                HF_FLORENCE, trust_remote_code=True, torch_dtype=dtype)
            self._florence_model.to(self.device)
            self._florence_model.eval()
            self._florence_processor = AutoProcessor.from_pretrained(
                HF_FLORENCE, trust_remote_code=True)

    def describe_florence(self, img) -> str:
        import torch

        self._ensure_florence()
        task = "<MORE_DETAILED_CAPTION>"
        inputs = self._florence_processor(text=task, images=img, return_tensors="pt")
        pixel_values = inputs["pixel_values"].to(self.device)
        if self.device.startswith("cuda"):
            pixel_values = pixel_values.half()
        input_ids = inputs["input_ids"].to(self.device)
        with torch.no_grad():
            generated_ids = self._florence_model.generate(
                input_ids=input_ids,
                pixel_values=pixel_values,
                max_new_tokens=256,
                min_length=30,
                num_beams=5,
                no_repeat_ngram_size=2,
                do_sample=False,
            )
        generated_text = self._florence_processor.batch_decode(
            generated_ids, skip_special_tokens=False)[0]
        parsed = self._florence_processor.post_process_generation(
            generated_text, task=task, image_size=(img.size[0], img.size[1]))
        return parsed.get(task, "")


# ---------------------------------------------------------------------------
# Detection + OCR orchestration
# ---------------------------------------------------------------------------
def convert_detections(raw: List[dict], model_name: str,
                       image_width: int, image_height: int) -> List[dict]:
    """Port of convertDetections: normalise boxes to 0..1 and round to 4 decimals."""
    out = []
    for item in raw:
        box = item["box"]
        out.append({
            "label": item["label"],
            "probability": to_fixed_number(item["score"], 4),
            "box": {
                "ymin": to_fixed_number(box["ymin"] / image_height, 4),
                "xmin": to_fixed_number(box["xmin"] / image_width, 4),
                "ymax": to_fixed_number(box["ymax"] / image_height, 4),
                "xmax": to_fixed_number(box["xmax"] / image_width, 4),
            },
            "modelName": model_name,
        })
    return out


def detect_objects(registry: ModelRegistry, img, min_probability: float,
                   file_name: str) -> List[dict]:
    """Port of detectObjects: run every selected detection model over an image."""
    predictions: List[dict] = []
    width, height = img.size
    min_prob_local = min_probability / 100.0
    if MODEL_DETR in registry.selected:
        try:
            raw = registry.detect_detr(img, min_prob_local)
            predictions.extend(convert_detections(raw, MODEL_DETR, width, height))
        except Exception as err:  # defensive parity with the JS try/catch
            logger.error("DETR detection failed for %s: %s", file_name, err)
            predictions.append(_detection_error(err, "DETR50 - 90 labels (~165 MB)"))
    if MODEL_OWLVIT in registry.selected:
        try:
            raw = registry.detect_owlvit(img, min_prob_local)
            predictions.extend(convert_detections(raw, MODEL_OWLVIT, width, height))
        except Exception as err:  # defensive parity with the JS try/catch
            logger.error("OWL-ViT detection failed for %s: %s", file_name, err)
            predictions.append(_detection_error(err, "OWL-ViT - 1203 labels (~615 MB)"))
    return predictions


def _detection_error(err: Exception, model_label: str) -> dict:
    return {
        "label": f"Error during objects detection: {err} - {model_label}",
        "probability": 0.0,
        "box": {"ymin": 0.0, "xmin": 0.0, "ymax": 0.0, "xmax": 0.0},
        "modelName": model_label,
    }


def get_image_description(registry: ModelRegistry, img, is_image: bool) -> str:
    """Port of getImageDescription: Florence-2 caption, photos only."""
    if not is_image or MODEL_FLORENCE not in registry.selected:
        return ""
    try:
        return registry.describe_florence(img)
    except Exception as err:  # defensive parity with the JS try/catch
        logger.error("Florence-2 description failed: %s", err)
        return f"[Error during image description generation: {err}]"


def perform_ocr(img, languages: List[str], min_ocr_probability: float) -> str:
    """Port of performOCR: Tesseract TSV words above the confidence threshold."""
    import pytesseract
    from pytesseract import Output

    ocr_img = resize_max_dim(img.convert("RGB"), MAX_IMAGE_SIZE_FOR_OCR)
    lang = "+".join(languages) if languages else "eng"
    try:
        data = pytesseract.image_to_data(ocr_img, lang=lang, output_type=Output.DICT)
    except Exception as err:
        logger.error("OCR failed: %s", err)
        return ""
    words = []
    for text, conf in zip(data["text"], data["conf"]):
        word = (text or "").strip()
        try:
            conf_val = float(conf)
        except (TypeError, ValueError):
            continue
        if word and conf_val >= min_ocr_probability:
            words.append(word)
    return " ".join(words).strip()


# ---------------------------------------------------------------------------
# Per-file processing
# ---------------------------------------------------------------------------
def new_file_data(path: Path, rel_path: str, mime_type: str) -> dict:
    stat = path.stat()
    last_modified = _dt.datetime.fromtimestamp(stat.st_mtime, tz=_dt.timezone.utc)
    return {
        "fileName": path.name,
        "filePath": rel_path,
        "lastModifiedDate": last_modified,
        "objectsDetected": [],
        "desc": "",
        "previewData": None,
        "dateCreated": last_modified,
        "exifData": {},
        "ocrText": "",
        "isImage": False,
        "isVideo": False,
        "framesData": [],
        "fileType": mime_type,
        "width": 0,
        "height": 0,
        "videoDuration": 0,
        "fileSize": stat.st_size,
        "checkSum": "",
        "processingStatus": "",
    }


def process_image(registry: ModelRegistry, path: Path, file_data: dict, opts: "Options",
                  img=None, is_image: bool = True) -> None:
    """Port of processImage. ``img`` may be supplied directly for video frames."""
    from PIL import Image

    own_image = img is None
    if own_image:
        opts.report_operation("Decode Image Data")
        img = Image.open(path)
        img.load()
    rgb = img.convert("RGB")
    file_data["width"] = rgb.size[0]
    file_data["height"] = rgb.size[1]

    # Preview.
    opts.report_operation("Preview Generation")
    preview_url, _, _ = image_to_jpeg_data_url(rgb, PREVIEW_SIZE)
    if opts.add_preview:
        file_data["previewData"] = preview_url

    # EXIF (real images only; video frames extract metadata separately).
    if opts.extract_exif and is_image:
        opts.report_operation("EXIF Extraction")
        exif = extract_image_exif(path)
        file_data["exifData"] = exif
        if exif.get("dateTaken") and exif["dateTaken"] != NOT_AVAILABLE:
            file_data["dateCreated"] = exif["dateTaken"]

    # Object detection on a copy resized to the detection max dimension.
    opts.report_operation("Objects Detection")
    detect_img = resize_max_dim(rgb, MAX_IMAGE_SIZE_FOR_OBJ_DETECTION)
    file_data["objectsDetected"] = detect_objects(
        registry, detect_img, opts.min_probability, file_data["fileName"])

    # Description (photos only).
    if is_image and MODEL_FLORENCE in opts.models:
        opts.report_operation("Generate Image Description")
    file_data["desc"] = get_image_description(registry, detect_img, is_image)

    # OCR.
    if opts.ocr_enabled:
        opts.report_operation("OCR")
        file_data["ocrText"] = perform_ocr(rgb, opts.languages, opts.min_ocr_probability)


def process_video(registry: ModelRegistry, path: Path, file_data: dict, opts: "Options") -> None:
    """Port of processVideo: sample frames every interval ms and process each."""
    duration, width, height = get_video_duration_size(path)
    file_data["framesData"] = []
    total_frames = int(math.floor(duration * 1000 / opts.video_indexing_interval)) if duration else 0
    preview_frame = int(math.floor(total_frames / 2))

    for i in range(total_frames + 1):
        time_sec = i * opts.video_indexing_interval / 1000.0
        frame = _extract_video_frame(path, time_sec)
        if frame is None:
            continue
        frame_data = {
            "fileName": file_data["fileName"], "width": 0, "height": 0,
            "objectsDetected": [], "desc": "", "previewData": None, "ocrText": "",
        }
        video_preview_enabled = opts.add_preview and (preview_frame == i)
        # Frames are processed as images, but with isImage=False (no EXIF/description).
        frame_opts = opts.copy_with(
            add_preview=video_preview_enabled, extract_exif=False,
            operation_prefix=f"[Video ({time_sec}s/{duration}s)] ")
        process_image(registry, path, frame_data, frame_opts, img=frame, is_image=False)
        if video_preview_enabled and frame_data.get("previewData"):
            file_data["previewData"] = frame_data["previewData"]
        file_data["framesData"].append({
            "time": float(time_sec),
            "objectsDetected": frame_data["objectsDetected"],
            "ocrText": frame_data["ocrText"],
        })
        file_data["videoDuration"] = duration
        file_data["width"] = width
        file_data["height"] = height

    if opts.extract_exif:
        exif = extract_video_metadata(path)
        if exif.get("dateTaken") and exif["dateTaken"] != NOT_AVAILABLE:
            file_data["dateCreated"] = exif["dateTaken"]
        file_data["exifData"] = exif


def _extract_video_frame(path: Path, time_sec: float):
    """Grab a single frame at time_sec using ffmpeg, return a PIL image (or None)."""
    from PIL import Image

    try:
        out = subprocess.check_output(
            ["ffmpeg", "-v", "quiet", "-ss", f"{time_sec}", "-i", str(path),
             "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "pipe:1"],
            stderr=subprocess.DEVNULL)
        if not out:
            return None
        return Image.open(io.BytesIO(out)).convert("RGB")
    except Exception as err:
        logger.warning("Frame extraction failed at %.2fs for %s: %s", time_sec, path, err)
        return None


# ---------------------------------------------------------------------------
# Output building
# ---------------------------------------------------------------------------
class _DateAwareEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, _dt.datetime):
            return js_date_iso(o)
        return super().default(o)


def build_archive_html(processed_files: List[dict]) -> str:
    template = load_final_html()
    source_data = json.dumps(processed_files, cls=_DateAwareEncoder,
                             ensure_ascii=False, separators=(",", ":"))
    return template.replace("{source_data}", source_data)


def current_timestamp_filename() -> str:
    now = _dt.datetime.now()
    return now.strftime("%Y%m%d_%H%M%S") + "_media_archive.html"


# ---------------------------------------------------------------------------
# Status report (fixed, non-scrolling panel -- mirrors the web UI status block)
# ---------------------------------------------------------------------------
def _normalize_status(status: str) -> str:
    """Port of normalizeStatus: collapse any non-success status to "Error"."""
    return "Success" if status == FILE_PROCESSING_STATUS_SUCCESS else "Error"


def compress_statuses(statuses: List[str]) -> str:
    """Port of compressStatuses: run-length encode the last statuses, e.g.
    "Success(7), Error(1), Success(2)"."""
    if not statuses:
        return ""
    result = []
    current = _normalize_status(statuses[0])
    count = 1
    for s in statuses[1:]:
        normalized = _normalize_status(s)
        if normalized == current:
            count += 1
        else:
            result.append(f"{current}({count})")
            current = normalized
            count = 1
    result.append(f"{current}({count})")
    return ", ".join(result)


def _format_time_interval(milliseconds: float) -> str:
    """Port of formatTimeInterval: HH:MM:SS.mmm (with a leading "Nd " for days)."""
    milliseconds = int(milliseconds)
    ms = milliseconds % 1000
    seconds = (milliseconds // 1000) % 60
    minutes = (milliseconds // (1000 * 60)) % 60
    hours = (milliseconds // (1000 * 60 * 60)) % 24
    days = milliseconds // (1000 * 60 * 60 * 24)
    base = f"{hours:02d}:{minutes:02d}:{seconds:02d}.{ms:03d}"
    return f"{days}d {base}" if days > 0 else base


class StatusReporter:
    """A fixed, non-scrolling status panel for the terminal that mirrors the
    status block of the HTML version.

    The panel is redrawn in place at the bottom of the screen while ordinary log
    lines scroll above it. It activates only on an interactive TTY; when output
    is redirected (e.g. to a file or a pipe) it does nothing, so logs stay clean.
    The web-only "Screen Wake Lock" and "Current Image" rows are intentionally
    omitted.
    """

    _LABELS = [
        ("file_count", "Total Files to Index"),
        ("files_indexed", "Files Indexed"),
        ("files_success", "Files Indexed Successfully"),
        ("files_error", "Files Indexed with Error"),
        ("last10", "Last 10 Files Status"),
        ("progress", "Indexing Progress"),
        ("processing_time", "Processing Time"),
        ("remaining_time", "Remaining Time"),
        ("current_file", "Current File"),
        ("current_operation", "Current Operation"),
        ("backend", "Processing ML Backend"),
    ]

    def __init__(self, stream=None, enabled: Optional[bool] = None):
        self.stream = stream if stream is not None else sys.stderr
        if enabled is None:
            enabled = bool(getattr(self.stream, "isatty", lambda: False)())
        self.enabled = enabled
        self._start_time = time.time()
        self._lines_drawn = 0
        self._finished = False
        self.values = {
            "file_count": "0", "files_indexed": "0", "files_success": "0",
            "files_error": "0", "last10": "", "progress": "0%",
            "processing_time": "", "remaining_time": "", "current_file": "",
            "current_operation": "", "backend": "",
        }
        # State used to compute the derived fields.
        self.total = 0
        self.indexed = 0
        self._statuses: List[str] = []

    # -- public API -------------------------------------------------------
    def start(self, total: int) -> None:
        self.total = total
        self._start_time = time.time()
        self.values["file_count"] = str(total)
        self._render()

    def set_backend(self, backend: str) -> None:
        self.values["backend"] = backend
        self._render()

    def set_current_file(self, text: str) -> None:
        self.values["current_file"] = text
        self._render()

    def set_operation(self, text: str) -> None:
        self.values["current_operation"] = text
        self._update_times()
        self._render()

    def file_done(self, status: str) -> None:
        self.indexed += 1
        self._statuses.append(status)
        success = sum(1 for s in self._statuses if s == FILE_PROCESSING_STATUS_SUCCESS)
        self.values["files_indexed"] = str(self.indexed)
        self.values["files_success"] = str(success)
        self.values["files_error"] = str(self.indexed - success)
        self.values["last10"] = compress_statuses(self._statuses[-10:])
        progress = (self.indexed / self.total) if self.total else 0.0
        self.values["progress"] = f"{progress * 100:.2f}%"
        self._update_times()
        self._render()

    def finish(self) -> None:
        """Leave the final panel on screen and move the cursor below it."""
        if self.enabled and self._lines_drawn:
            self.stream.write("\n")
            self.stream.flush()
            self._lines_drawn = 0
        # The panel is now frozen on screen. Any later log output (e.g. the final
        # "Processing finished" / "Archive written" summary, which still routes
        # through this reporter's logging handler) must scroll plainly below it --
        # redrawing the panel here would print a duplicate copy.
        self._finished = True

    # -- logging integration ---------------------------------------------
    def logging_handler(self) -> "logging.Handler":
        """A logging handler that prints log lines above the fixed panel."""
        return _StatusLogHandler(self)

    # -- internals --------------------------------------------------------
    def _update_times(self) -> None:
        processing_ms = (time.time() - self._start_time) * 1000.0
        self.values["processing_time"] = _format_time_interval(processing_ms)
        progress = (self.indexed / self.total) if self.total else 0.0
        if progress > 0:
            total_estimate = processing_ms / progress
            remaining = total_estimate - processing_ms
            self.values["remaining_time"] = (
                _format_time_interval(remaining) if remaining > 0 else NOT_AVAILABLE)
        else:
            self.values["remaining_time"] = ""

    def _clear(self) -> None:
        if self._lines_drawn:
            # Move up over the panel and erase to the end of the screen.
            self.stream.write(f"\x1b[{self._lines_drawn}A\x1b[J")
            self._lines_drawn = 0

    @staticmethod
    def _term_width() -> int:
        try:
            import shutil as _sh
            return max(20, _sh.get_terminal_size((100, 24)).columns)
        except Exception:
            return 100

    @classmethod
    def _fit(cls, line: str) -> str:
        """Truncate a line to the terminal width so it never wraps onto a second
        physical line (which would break the panel's cursor accounting)."""
        width = cls._term_width()
        if len(line) > width:
            return line[:max(1, width - 1)] + "…"
        return line

    def _render(self) -> None:
        if not self.enabled:
            return
        self._clear()
        label_w = max(len(label) for _, label in self._LABELS)
        lines = ["", "--- Indexing status ---"]
        for key, label in self._LABELS:
            lines.append(self._fit(f"  {label + ':':<{label_w + 1}} {self.values[key]}"))
        text = "\n".join(lines) + "\n"
        self.stream.write(text)
        self.stream.flush()
        self._lines_drawn = len(lines)

    def write_log_line(self, text: str) -> None:
        """Print a scrolling log line above the panel, then redraw the panel."""
        for line in text.split("\n"):
            self._write_one_line(line)

    def _write_one_line(self, line: str) -> None:
        if not self.enabled or self._finished:
            self.stream.write(line + "\n")
            self.stream.flush()
            return
        # Erase the panel, print the log line where the panel was, redraw below.
        self._clear()
        self.stream.write(self._fit(line) + "\n")
        self._render()

    def redirect_output(self) -> "_OutputRedirect":
        """Context manager that routes ALL stdout/stderr writes (including ones
        from libraries that bypass logging, e.g. model download/progress output)
        through the panel, so nothing ever corrupts the fixed status block."""
        return _OutputRedirect(self)


class _StatusLogHandler(logging.Handler):
    def __init__(self, reporter: StatusReporter):
        super().__init__()
        self._reporter = reporter

    def emit(self, record: "logging.LogRecord") -> None:
        try:
            self._reporter.write_log_line(self.format(record))
        except Exception:  # pragma: no cover - never let logging crash indexing
            self.handleError(record)


class _LineProxyStream:
    """A writable stream that buffers text and forwards each completed line to
    the reporter (so it scrolls above the fixed panel). Partial lines are held
    until their newline arrives."""

    def __init__(self, reporter: "StatusReporter"):
        self._reporter = reporter
        self._buf = ""

    def write(self, text):
        if not text:
            return 0
        self._buf += text
        # '\r' (used by progress bars) is treated as a line end too.
        while True:
            idx = min((i for i in (self._buf.find("\n"), self._buf.find("\r")) if i >= 0),
                      default=-1)
            if idx < 0:
                break
            line = self._buf[:idx]
            self._buf = self._buf[idx + 1:]
            if line.strip():
                self._reporter.write_log_line(line)
        return len(text)

    def flush(self):
        if self._buf.strip():
            self._reporter.write_log_line(self._buf)
        self._buf = ""

    def isatty(self):
        return False


class _OutputRedirect:
    """Swap sys.stdout/sys.stderr for line proxies while active (no-op when the
    panel is disabled)."""

    def __init__(self, reporter: "StatusReporter"):
        self._reporter = reporter
        self._saved = None

    def __enter__(self):
        if self._reporter.enabled:
            self._saved = (sys.stdout, sys.stderr)
            proxy = _LineProxyStream(self._reporter)
            sys.stdout = proxy
            sys.stderr = proxy
        return self

    def __exit__(self, *exc):
        if self._saved is not None:
            try:
                sys.stdout.flush()
            except Exception:
                pass
            sys.stdout, sys.stderr = self._saved
            self._saved = None
        return False


# ---------------------------------------------------------------------------
# Options / CLI
# ---------------------------------------------------------------------------
class Options:
    def __init__(self, **kw):
        self.min_probability: float = kw["min_probability"]
        self.index_video: bool = kw["index_video"]
        self.video_indexing_interval: int = kw["video_indexing_interval"]
        self.ocr_enabled: bool = kw["ocr_enabled"]
        self.min_ocr_probability: float = kw["min_ocr_probability"]
        self.add_preview: bool = kw["add_preview"]
        self.extract_exif: bool = kw["extract_exif"]
        self.languages: List[str] = kw["languages"]
        self.models: List[str] = kw["models"]
        # Optional status panel (None during unit tests / video-frame sub-calls).
        self.reporter: Optional["StatusReporter"] = kw.get("reporter")
        # Prefix prepended to operation messages (e.g. "[Video (5.0s/10s)] ").
        self.operation_prefix: str = kw.get("operation_prefix", "")

    def report_operation(self, text: str) -> None:
        if self.reporter is not None:
            self.reporter.set_operation(self.operation_prefix + text)

    def copy_with(self, **kw) -> "Options":
        base = dict(
            min_probability=self.min_probability,
            index_video=self.index_video,
            video_indexing_interval=self.video_indexing_interval,
            ocr_enabled=self.ocr_enabled,
            min_ocr_probability=self.min_ocr_probability,
            add_preview=self.add_preview,
            extract_exif=self.extract_exif,
            languages=self.languages,
            models=self.models,
            reporter=self.reporter,
            operation_prefix=self.operation_prefix,
        )
        base.update(kw)
        return Options(**base)


def _str2bool(value: str) -> bool:
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in ("1", "true", "yes", "y", "on", "checked")


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="indexer.py",
        description="Create a searchable ML media archive (Python port of the HTML+JS app). "
                    "All web-UI controls are available as parameters with identical defaults.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("-i", "--input", dest="input", required=True,
                        default=argparse.SUPPRESS,
                        help="Folder to index (recursively). Mirrors the 'Folder to Index' "
                             "picker. Required.")
    parser.add_argument("-o", "--output", default=current_timestamp_filename(),
                        help="Output HTML file path. A bare filename is written to the current "
                             "directory. Defaults to a timestamped name.")
    parser.add_argument("--models", default=",".join(ALL_MODEL_NAMES),
                        help="Comma-separated ML models to run. Choices: "
                             f"{MODEL_DETR}, {MODEL_OWLVIT}, {MODEL_FLORENCE}.")
    parser.add_argument("--min-probability", type=float, default=55.0,
                        help="Minimum object-detection probability, percent (1-100).")
    parser.add_argument("--add-preview", type=_str2bool, default=True,
                        help="Embed a small base64 preview image per file.")
    parser.add_argument("--index-video", type=_str2bool, default=True,
                        help="Process video files (sample frames).")
    parser.add_argument("--video-indexing-interval", type=int, default=5000,
                        help="Milliseconds between sampled video frames (1-30000).")
    parser.add_argument("--ocr-enabled", type=_str2bool, default=True,
                        help="Run Tesseract OCR on images and frames.")
    parser.add_argument("--min-ocr-probability", type=float, default=80.0,
                        help="Minimum OCR confidence, percent (1-100).")
    parser.add_argument("--ocr-languages", default="eng,fra,nld",
                        help="Comma-separated Tesseract language codes (e.g. eng,fra,nld).")
    parser.add_argument("--extract-exif", type=_str2bool, default=True,
                        help="Extract EXIF / video metadata and closest cities.")
    parser.add_argument("--device", default="auto",
                        help="Torch device: 'auto' (GPU if available, else CPU), 'cpu' or 'cuda'.")
    parser.add_argument("--log-level", default="INFO",
                        help="Logging level (DEBUG, INFO, WARNING, ERROR).")
    parser.add_argument("--no-status", action="store_true",
                        help="Disable the live, fixed status panel (also off when "
                             "output is not a terminal).")
    parser.add_argument("--version", action="version", version=f"ml-media-archive {__version__}")
    return parser


def parse_models(models_arg: str) -> List[str]:
    requested = [m.strip() for m in models_arg.split(",") if m.strip()]
    valid = []
    for m in requested:
        if m in ALL_MODEL_NAMES:
            valid.append(m)
        else:
            logger.warning("Unknown model ignored: %s", m)
    return valid


def discover_files(folder: Path) -> List[Path]:
    return [p for p in sorted(folder.rglob("*")) if p.is_file()]


def mime_for(path: Path) -> Optional[str]:
    ext = path.suffix.lower()
    if ext in IMAGE_MIME_TYPES:
        return IMAGE_MIME_TYPES[ext]
    if ext in VIDEO_MIME_TYPES:
        return VIDEO_MIME_TYPES[ext]
    return None


def _quiet_noisy_libraries(panel_enabled: bool) -> None:
    """Reduce direct-to-stderr chatter from the ML stack so the status panel
    (and the logs) stay clean. Progress bars are disabled when the panel is on."""
    if panel_enabled:
        os.environ.setdefault("HF_HUB_DISABLE_PROGRESS_BARS", "1")
        os.environ.setdefault("TRANSFORMERS_NO_ADVISORY_WARNINGS", "1")
        os.environ.setdefault("TQDM_DISABLE", "1")
    try:
        from transformers.utils import logging as hf_logging
        hf_logging.set_verbosity_error()
    except Exception:
        pass


def _index_all_files(files, folder, registry, opts, reporter, processed_files) -> None:
    """Index every discovered file, updating the status panel as it goes."""
    for index, path in enumerate(files):
        mime_type = mime_for(path)
        rel_path = f"{folder.name}/{path.relative_to(folder).as_posix()}"
        if mime_type is None:
            logger.info("Unsupported file type, skipping: %s", rel_path)
            continue

        file_data = new_file_data(path, rel_path, mime_type)
        logger.info("[%d/%d] %s (%s)", index + 1, len(files), rel_path,
                    format_bytes(file_data["fileSize"]))
        reporter.set_current_file(
            f"{index + 1} - \"{rel_path}\". file size: {format_bytes(file_data['fileSize'])}.")
        file_data["checkSum"] = get_file_checksum(path)
        status = ""
        is_video = mime_type in VIDEO_MIME_TYPES.values()
        is_image = mime_type in IMAGE_MIME_TYPES.values()

        try:
            if is_video:
                file_data["isVideo"] = True
                if opts.index_video:
                    reporter.set_operation("Video Processing")
                    process_video(registry, path, file_data, opts)
                status = FILE_PROCESSING_STATUS_SUCCESS
            elif is_image:
                file_data["isImage"] = True
                reporter.set_operation("Image Processing")
                process_image(registry, path, file_data, opts, is_image=True)
                status = FILE_PROCESSING_STATUS_SUCCESS
        except Exception as err:  # parity with the JS per-file try/catch
            kind = "Video" if is_video else "Image"
            status = f"{kind} error: {err}"
            logger.exception("Error processing %s", rel_path)

        if (status == FILE_PROCESSING_STATUS_SUCCESS
                and isinstance(file_data.get("desc"), str)
                and "Error during image description generation" in file_data["desc"]):
            status = file_data["desc"]

        file_data["processingStatus"] = status
        processed_files.append(file_data)
        reporter.file_done(status)


def _log_effective_arguments(args: argparse.Namespace, folder: Path, output_path: Path) -> None:
    """Print every argument and the value actually used, so a run is reproducible.

    Defaults that were not given on the command line are shown with their resolved
    value; ``--input`` / ``--output`` are shown as the absolute paths in use.
    """
    values = dict(vars(args))
    values["input"] = str(folder)
    values["output"] = str(output_path)
    # Show input/output first, then the remaining options in parser order.
    ordered = ["input", "output"] + [k for k in values if k not in ("input", "output")]
    lines = ["Running indexer with the following arguments:"]
    for dest in ordered:
        lines.append(f"  --{dest.replace('_', '-')}: {values[dest]}")
    logger.info("\n".join(lines))


def run(args: argparse.Namespace) -> int:
    # The status panel is shown on an interactive terminal unless --no-status is
    # given (and never when stdout/stderr is redirected, e.g. to a file).
    show_status = not getattr(args, "no_status", False)
    reporter = StatusReporter(enabled=show_status if _stderr_is_tty() else False)

    log_format = "[%(asctime)s] %(levelname)s %(message)s"
    log_datefmt = "%Y-%m-%d %H:%M:%S"
    level = getattr(logging, str(args.log_level).upper(), logging.INFO)
    if reporter.enabled:
        # Route logs through the reporter so they scroll above the fixed panel.
        handler = reporter.logging_handler()
        handler.setFormatter(logging.Formatter(log_format, log_datefmt))
        logging.basicConfig(level=level, handlers=[handler], force=True)
    else:
        logging.basicConfig(level=level, format=log_format, datefmt=log_datefmt)

    folder = Path(args.input).expanduser().resolve()
    output_path = Path(args.output).expanduser().resolve()

    _log_effective_arguments(args, folder, output_path)

    if not folder.is_dir():
        logger.error("Folder not found: %s", folder)
        return 2

    models = parse_models(args.models)
    opts = Options(
        min_probability=args.min_probability,
        index_video=args.index_video,
        video_indexing_interval=args.video_indexing_interval,
        ocr_enabled=args.ocr_enabled,
        min_ocr_probability=args.min_ocr_probability,
        add_preview=args.add_preview,
        extract_exif=args.extract_exif,
        languages=[l.strip() for l in args.ocr_languages.split(",") if l.strip()],
        models=models,
        reporter=reporter,
    )

    files = discover_files(folder)
    logger.info("Total files to index: %d", len(files))
    warn_missing_external_tools(opts, files)

    _quiet_noisy_libraries(reporter.enabled)
    registry = ModelRegistry(models, device=args.device)
    reporter.start(len(files))
    reporter.set_backend(registry.device)
    processed_files: List[dict] = []
    start = time.time()

    # Route any stray library output (e.g. model download/progress lines that
    # bypass logging) through the panel so it never corrupts the status block.
    try:
        with reporter.redirect_output():
            _index_all_files(files, folder, registry, opts, reporter, processed_files)
            reporter.set_operation("Full Processing is Completed")
    finally:
        reporter.finish()

    elapsed = time.time() - start
    logger.info("Processing finished in %.1fs. Indexed %d files.", elapsed, len(processed_files))

    html = build_archive_html(processed_files)
    output_path.write_text(html, encoding="utf-8")
    logger.info("Archive written to %s (%s)", output_path, format_bytes(len(html.encode("utf-8"))))
    return 0


def _stderr_is_tty() -> bool:
    try:
        return bool(sys.stderr.isatty())
    except Exception:
        return False


# Install pages for the external command-line tools the Python app relies on.
TESSERACT_INSTALL_URL = "https://tesseract-ocr.github.io/tessdoc/Installation.html"
FFMPEG_INSTALL_URL = "https://ffmpeg.org/download.html"


def warn_missing_external_tools(opts: "Options", files: List[Path]) -> None:
    """Warn up-front (with install links) when a required external tool is
    missing, instead of failing once per file deep in processing."""
    has_video = any(mime_for(p) in VIDEO_MIME_TYPES.values() for p in files)

    if opts.ocr_enabled and shutil.which("tesseract") is None:
        logger.warning(
            "Tesseract OCR is not installed or not on PATH, so OCR text will be "
            "empty. Install it (and the eng/fra/nld language packs) from %s, or "
            "re-run with --ocr-enabled false.", TESSERACT_INSTALL_URL)

    if has_video and opts.index_video and (
            shutil.which("ffmpeg") is None or shutil.which("ffprobe") is None):
        logger.warning(
            "FFmpeg (ffmpeg/ffprobe) is not installed or not on PATH, so videos "
            "cannot be indexed (frames and video metadata will be skipped). "
            "Install it from %s, or re-run with --index-video false.",
            FFMPEG_INSTALL_URL)


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)
    return run(args)


# ---------------------------------------------------------------------------
# EMBEDDED DATA  (generated -- do not edit by hand)
# ---------------------------------------------------------------------------
# These three blobs make the script self-contained. They are produced by
# ``python/tools/build_embedded.py`` from the web project's data files:
#   * CITIES_GZ_B64         -- z_cities1000_sorted_by_lon_lat_{1,2}.js
#   * OWLVIT_LABELS_GZ_B64  -- labelsData from indexer.js
#   * FINAL_HTML_GZ_B64     -- FINAL_HTML from the built target/indexer.js
# When empty, the loaders fall back to MEDIA_ARCHIVE_DATA_DIR (development mode).
CITIES_GZ_B64 = ""
OWLVIT_LABELS_GZ_B64 = ""
FINAL_HTML_GZ_B64 = ""


if __name__ == "__main__":
    sys.exit(main())
