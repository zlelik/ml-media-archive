"""Unit tests for the deterministic logic of the Python indexer.

These tests cover the pure helpers that must match the JavaScript implementation
exactly (geocoding, EXIF date formatting, rounding, coordinate parsing, OWL-ViT
label enrichment, archive assembly). They do NOT run the ML models, so they are
fast and require no model downloads.

Run with:  pytest        (from the python/ directory)
"""
import datetime as dt
import importlib.util
from pathlib import Path

import pytest

# Load the built, self-contained program if present (it has the cities/labels/
# FINAL_HTML data embedded); otherwise fall back to the source module (logic
# only, empty data blobs -- the data-dependent tests then skip). Build the data
# with: `cd web && mvn clean verify` then `cd python && python tools/build_embedded.py`.
_HERE = Path(__file__).resolve().parent
_DIST = _HERE.parent / "dist" / "indexer.py"
_SRC = _HERE.parent / "src" / "ml_media_archive" / "indexer.py"
_MODULE_PATH = _DIST if _DIST.is_file() else _SRC

_spec = importlib.util.spec_from_file_location("ml_media_archive_indexer", _MODULE_PATH)
idx = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(idx)

_HAVE_DATA = bool(idx.CITIES_GZ_B64)
needs_data = pytest.mark.skipif(
    not _HAVE_DATA,
    reason="data not embedded; build dist with mvn verify + tools/build_embedded.py")


# --- rounding helpers ------------------------------------------------------
def test_to_fixed_number_matches_js_tofixed():
    # Same results as JavaScript Number(v.toFixed(4)): both use IEEE-754
    # doubles, so e.g. 0.99615 is stored as 0.996149... and rounds down.
    assert idx.to_fixed_number(0.58523, 4) == 0.5852
    assert idx.to_fixed_number(0.025, 4) == 0.025
    assert idx.to_fixed_number(0.99615, 4) == 0.9961
    assert idx.to_fixed_number(0.99625, 4) == 0.9962


def test_change_double_precision_drops_trailing_zeros():
    assert idx.change_double_precision(1.0620001, 3) == 1.062
    assert idx.change_double_precision(3.39, 3) == 3.39


def test_format_bytes():
    assert idx.format_bytes(0) == "0 Bytes"
    assert idx.format_bytes(1213670) == "1.16 MB"


# --- status panel helpers (mirror the web UI status block) ------------------
def test_compress_statuses_matches_js():
    assert idx.compress_statuses([]) == ""
    assert idx.compress_statuses(["Success"]) == "Success(1)"
    assert (idx.compress_statuses(["Success", "Success", "Video error: x", "Success"])
            == "Success(2), Error(1), Success(1)")


def test_format_time_interval():
    assert idx._format_time_interval(0) == "00:00:00.000"
    assert idx._format_time_interval(65000) == "00:01:05.000"
    assert idx._format_time_interval(90061500) == "1d 01:01:01.500"


def test_status_reporter_accumulates_and_is_silent_when_disabled():
    import io
    buf = io.StringIO()
    r = idx.StatusReporter(stream=buf, enabled=False)
    r.start(2)
    r.set_backend("cpu")
    r.file_done("Success")
    r.file_done("Video error: y")
    r.finish()
    assert r.values["files_indexed"] == "2"
    assert r.values["files_success"] == "1"
    assert r.values["files_error"] == "1"
    assert r.values["progress"] == "100.00%"
    assert r.values["last10"] == "Success(1), Error(1)"
    # disabled reporter must not draw the panel
    assert "Indexing status" not in buf.getvalue()


def test_status_reporter_renders_panel_on_tty():
    import io
    import re
    buf = io.StringIO()
    r = idx.StatusReporter(stream=buf, enabled=True)
    r.start(1)
    r.set_backend("cuda")
    r.file_done("Success")
    plain = re.sub(r"\x1b\[[0-9;]*[A-Za-z]", "", buf.getvalue())
    assert "--- Indexing status ---" in plain
    assert "Total Files to Index:" in plain
    assert "Processing ML Backend:" in plain
    # web-only rows must NOT appear
    assert "Screen Wake Lock" not in plain
    assert "Current Image" not in plain


# --- device resolution -----------------------------------------------------
def _force_no_cuda(monkeypatch):
    """Make `import torch` raise, so cuda is treated as unavailable."""
    import builtins
    real_import = builtins.__import__

    def fake_import(name, *args, **kwargs):
        if name == "torch":
            raise ImportError("simulated: torch unavailable")
        return real_import(name, *args, **kwargs)

    monkeypatch.setattr(builtins, "__import__", fake_import)


def test_resolve_device_cpu_is_always_cpu():
    assert idx.resolve_device("cpu") == "cpu"


def test_resolve_device_auto_returns_known_backend():
    assert idx.resolve_device("auto") in ("cpu", "cuda")


def test_resolve_device_cuda_falls_back_to_cpu_without_gpu(monkeypatch):
    """Requesting 'cuda' with no GPU must fall back to CPU (not crash)."""
    _force_no_cuda(monkeypatch)
    assert idx.resolve_device("cuda") == "cpu"


def test_resolve_device_auto_falls_back_to_cpu_without_torch(monkeypatch):
    """When a GPU/torch is unavailable, 'auto' must fall back to CPU."""
    _force_no_cuda(monkeypatch)
    assert idx.resolve_device("auto") == "cpu"


# --- date formatting -------------------------------------------------------
def test_parse_and_format_exif_date():
    parsed = idx._parse_exif_image_date("2025:04:27 20:41:02")
    assert idx.js_date_iso(parsed) == "2025-04-27T20:41:02.000Z"


def test_js_date_iso_has_millisecond_z_suffix():
    value = dt.datetime(2025, 4, 9, 6, 27, 35, tzinfo=dt.timezone.utc)
    assert idx.js_date_iso(value) == "2025-04-09T06:27:35.000Z"


# --- coordinate parsing (video metadata) -----------------------------------
def test_extract_coordinates_signed():
    assert idx.extract_coordinates("+52.1486+004.3914/") == (52.1486, 4.3914)


def test_extract_coordinates_with_hemisphere_letters():
    lat, lon = idx.extract_coordinates("20.8822N 86.8869W 4.300m")
    assert lat == pytest.approx(20.8822)
    assert lon == pytest.approx(-86.8869)


def test_extract_coordinates_empty():
    assert idx.extract_coordinates("") == (None, None)
    assert idx.extract_coordinates(None) == (None, None)


# --- haversine -------------------------------------------------------------
def test_haversine_zero_distance():
    assert idx.haversine(52.0, 4.0, 52.0, 4.0) == pytest.approx(0.0, abs=1e-9)


# --- closest cities (needs the embedded / dev cities DB) -------------------
@needs_data
def test_closest_cities_image_location_matches_reference():
    cities = idx.find_closest_cities(35.4177989, 24.651368299999998, 3, 5)
    names = [(c["name"], c["distance"]) for c in cities]
    assert names == [("Panormos", 3.583), ("Perama", 7.084), ("Rethymno", 16.388)]


@needs_data
def test_closest_cities_video_location_matches_reference():
    cities = idx.find_closest_cities(52.0799, 4.3854, 3, 5)
    names = [c["name"] for c in cities]
    assert names[:2] == ["Essesteijn", "Voorburg"]
    assert cities[0]["distance"] == 1.062
    assert cities[0]["country_code"] == "NL"


# --- detection conversion --------------------------------------------------
def test_convert_detections_normalises_and_rounds():
    raw = [{"label": "car", "score": 0.585234,
            "box": {"xmin": 93.1, "ymin": 18.0, "xmax": 1278.0, "ymax": 181.0}}]
    out = idx.convert_detections(raw, idx.MODEL_DETR, 1280, 720)
    assert out[0]["label"] == "car"
    assert out[0]["probability"] == 0.5852
    assert out[0]["modelName"] == idx.MODEL_DETR
    box = out[0]["box"]
    assert box["xmin"] == round(93.1 / 1280, 4)
    assert box["ymax"] == round(181.0 / 720, 4)
    assert list(box.keys()) == ["ymin", "xmin", "ymax", "xmax"]


# --- OWL-ViT probability <-> threshold mapping -----------------------------
def test_owlvit_threshold_mapping_is_monotonic():
    reg = idx.ModelRegistry([idx.MODEL_OWLVIT], device="cpu")
    t = reg._map_probability_to_threshold(0.55)
    assert 0 < t < 1
    assert reg._map_probability_to_threshold(0.9) > reg._map_probability_to_threshold(0.1)


@needs_data
def test_owlvit_label_enrichment():
    reg = idx.ModelRegistry([idx.MODEL_OWLVIT], device="cpu")
    reg._enrich_owlvit_labels()
    assert reg._owlvit_candidates, "candidate prompts should not be empty"
    sample = reg._owlvit_candidates[0]
    assert reg._owlvit_reverse[sample][0].isupper()


def test_deduplicate_boxes_keeps_higher_score():
    reg = idx.ModelRegistry([idx.MODEL_OWLVIT], device="cpu")
    a = {"label": "pen", "score": 0.6, "box": {"xmin": 10, "ymin": 10, "xmax": 50, "ymax": 50}}
    b = {"label": "pen", "score": 0.9, "box": {"xmin": 12, "ymin": 11, "xmax": 51, "ymax": 52}}
    kept = reg._deduplicate_boxes([a, b], 20)
    assert len(kept) == 1
    assert kept[0]["score"] == 0.9


# --- archive assembly ------------------------------------------------------
@needs_data
def test_build_archive_html_embeds_sourcedata():
    sample = [{
        "fileName": "x.jpg", "filePath": "d/x.jpg",
        "lastModifiedDate": dt.datetime(2025, 1, 1, tzinfo=dt.timezone.utc),
        "objectsDetected": [], "desc": "", "previewData": None,
        "dateCreated": dt.datetime(2025, 1, 1, tzinfo=dt.timezone.utc),
        "exifData": {}, "ocrText": "", "isImage": True, "isVideo": False,
        "framesData": [], "fileType": "image/jpeg", "width": 1, "height": 1,
        "videoDuration": 0, "fileSize": 1, "checkSum": "abc", "processingStatus": "Success",
    }]
    html = idx.build_archive_html(sample)
    assert "{source_data}" not in html
    assert '"fileName":"x.jpg"' in html
    assert "2025-01-01T00:00:00.000Z" in html


def test_mime_detection():
    assert idx.mime_for(Path("a.JPG")) == "image/jpeg"
    assert idx.mime_for(Path("a.mp4")) == "video/mp4"
    assert idx.mime_for(Path("a.mov")) == "video/quicktime"
    assert idx.mime_for(Path("a.txt")) is None


# --- closestCities must always be a list (the archive viewer calls .map on it) ---
def test_image_exif_closest_cities_is_list_without_gps(tmp_path):
    # An image with no readable EXIF/GPS must still produce closestCities == []
    # (never the "N/A" string), otherwise the viewer's closestCities.map(...)
    # throws and the whole grid renders empty.
    missing = tmp_path / "nope.jpg"
    exif = idx.extract_image_exif(missing)
    assert isinstance(exif["closestCities"], list)
    assert exif["closestCities"] == []


def test_video_metadata_closest_cities_is_list_without_ffprobe(tmp_path):
    missing = tmp_path / "nope.mp4"
    meta = idx.extract_video_metadata(missing)
    assert isinstance(meta["closestCities"], list)
    assert meta["closestCities"] == []
