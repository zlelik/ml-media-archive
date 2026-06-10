# Machine Learning Media Archive

This program creates a searchable archive of media (photos and videos),
incorporating object detection, image description and OCR using machine
learning. It uses Hugging Face models (Xenova/detr-resnet-50,
Xenova/owlvit-base-patch32 and Florence-2-base), extracts EXIF/video metadata,
performs GPS reverse-geocoding against a bundled cities database, and computes a
SHA-256 checksum for each file (OAIS practice). The result is a single,
self-contained, searchable HTML archive.

The project ships **two implementations of the same program, maintained in parallel**, plus the assets they share:

```
.
├── web/        # HTML + JavaScript implementation (Maven build, Selenide tests)
├── python/     # Python implementation (command-line)
├── shared/     # assets shared by both: test-data, releases, demo, models
├── README.md
└── RELEASE.md
```

Both produce the same archive format (an AG-Grid viewer with a
`sourceData = [ … ]` JSON array embedded inside), so an archive made by either
implementation opens in the same UI.

For every supported photo/video each implementation computes:

| Step | HTML+JS uses | Python uses |
|------|--------------|-------------|
| SHA-256 checksum | Web Crypto | `hashlib` |
| Base64 JPEG preview (max 150 px) | Canvas | Pillow |
| EXIF / video metadata + closest cities | exif.js / mediainfo.js + cities DB | Pillow / ffprobe + cities DB |
| Object detection (90 COCO classes) | DETR-ResNet-50 (Transformers.js) | `facebook/detr-resnet-50` (transformers) |
| Object detection (1203 LVIS classes, zero-shot) | OWL-ViT (Transformers.js) | `google/owlvit-base-patch32` |
| Image description (photos only) | Florence-2 (Transformers.js) | `microsoft/Florence-2-base` |
| OCR text | Tesseract.js | Tesseract (`pytesseract`) |

> **Note on parity between the two implementations:** the web app runs quantized
> ONNX models on the GPU via Transformers.js, while the Python app runs the
> original PyTorch weights (GPU or CPU) via `transformers`. Detection scores,
> descriptions and the base64 JPEG previews differ slightly between the two; the
> output *format* and the deterministic fields (checksums, EXIF, GPS, closest
> cities, dimensions, OCR text) match. Byte-equal output between the two
> implementations is not expected. The Python `transformers` version is kept in
> line with the Transformers.js version the web app uses (3.7.2 → `transformers`
> 4.45+).

---

## HTML+JavaScript implementation

A fully local, browser-based app (no server required, but it downloads models
and some libraries from the Internet). The sources is located in
[`web/src/main/webapp/`](web/src/main/webapp/). Starting from version 2.0.0 it
uses three Hugging Face models — Xenova/detr-resnet-50 (DETR50),
Xenova/owlvit-base-patch32 (OWL-ViT) and Florence-2-base (Florence 2).

### Build

Build from the command line inside the `web/` folder:

```bash
cd web
mvn clean verify    # compile, build, run tests and delete temporary files
mvn clean package   # compile, build, run tests and keep temporary files
```

`mvn clean verify` also packages the offline release
`shared/releases/release_<version>.zip` (containing both the built `web/` app
and the `python/` app).

### Run

After the build, `index.html` is created in `web/target/` along with all
required files. Open `web/target/index.html` in your browser to start the media
archive indexing module.

Alternatively, the program is available online here
[Blog](https://zlelik.blogspot.com/2025/03/ml-media-archive.html) or on
[GitHub Pages](https://zlelik.github.io/ml-media-archive/).

NOTE: the recommended browser is Chrome.

### Development and Testing

- Modify or run `web/src/main/webapp/index.html` along with the related
  JavaScript/CSS for the indexing module.
- Modify or run `web/src/main/webapp/archive-search.html` along with the related
  JavaScript/CSS for the search module.

Both files are fully functional and contain some test data; the build process
minifies and merges all required files. The Selenide/JUnit tests is located in
`web/src/test/java/`. The slow end-to-end test is disabled by default; enable it
with:

```bash
mvn -DfullIndexingCycleTest=true test
```

---

## Python Implementation

A command-line implementation that produces the same self-contained HTML
archive. Like the JavaScript version it uses Hugging Face `transformers`, and it
runs on the **GPU automatically when a CUDA device is available, falling back to
the CPU** otherwise (mirroring the web app's WebGPU → WASM fallback). Use
`--device cpu` or `--device cuda` to force a backend. The sources is located in
[`python/`](python/). It works on **Windows and Linux** (and macOS).

The cities database, OWL-ViT label definitions and the HTML viewer template are
all **embedded** in the shipped `python/dist/indexer.py`, so it runs with no
companion data files.

### Build

System tools required — install these and make sure they are on your `PATH`
(the program detects missing tools at startup and prints a warning with these
links; OCR is skipped without Tesseract and videos are skipped without FFmpeg):

- **Tesseract OCR** (for the `--ocr-enabled` text extraction), including the
  language packs you intend to use (`eng`, `fra`, `nld`, ...). Install guide:
  <https://tesseract-ocr.github.io/tessdoc/Installation.html>.
- **FFmpeg** — both `ffmpeg` and `ffprobe` (for indexing videos). Downloads and
  install instructions: <https://ffmpeg.org/download.html>

On Linux these are usually one command, e.g. on Debian/Ubuntu:
`sudo apt-get install ffmpeg tesseract-ocr tesseract-ocr-fra tesseract-ocr-nld`.
On Windows, install the binaries from the links above and add their folders to
the `PATH`.

The Python build **consumes the Maven build's output**, so build the web app
first (`cd web && mvn clean verify`). That produces `web/target/` and the
HTML+JS release zip; the Maven project itself knows nothing about Python.

**GPU vs CPU.** `requirements.txt` installs the **CUDA (GPU) build of PyTorch by
default** (a large, ~2.5 GB download). That build uses the GPU automatically when
one is available and falls back to the CPU otherwise — so on a GPU machine a
single `pip install -r requirements.txt` is all you need, and the program selects
the GPU on its own (`--device auto`, the default). On a machine with no NVIDIA
GPU, install the small CPU build instead (see the steps below) to avoid the
2.5 GB download.

#### Build steps — PC with an NVIDIA GPU (default)

**Linux / macOS**

```bash
cd web && mvn clean verify && cd ..        # 1. build the web app
cd python
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt            # 2. installs the CUDA (GPU) PyTorch + deps
python tools/build_embedded.py             # 3. build the Python program + add it to the release zip
```

**Windows (PowerShell or cmd)**

```bat
cd web && mvn clean verify && cd ..        REM 1. build the web app
cd python
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt            REM 2. installs the CUDA (GPU) PyTorch + deps
python tools\build_embedded.py             REM 3. build the Python program + add it to the release zip
```

#### Build steps — PC without a GPU (CPU-only)

First edit `requirements.txt` and comment out the three PyTorch lines near the
top (the `--extra-index-url` line and the two `==...+cu128` pins), then install
the small CPU build before the rest:

**Linux / macOS**

```bash
cd web && mvn clean verify && cd ..
cd python
python3 -m venv .venv
. .venv/bin/activate
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
python tools/build_embedded.py
```

**Windows (PowerShell or cmd)**

```bat
cd web && mvn clean verify && cd ..
cd python
python -m venv .venv
.\.venv\Scripts\activate
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
python tools\build_embedded.py
```

The program runs on the GPU automatically when one is available (`--device auto`,
the default). If you ask for `--device cuda` but PyTorch cannot see a GPU (for
example because the CPU-only build is installed), it prints why and falls back to
CPU. The default wheels are the CUDA 12.8 (`cu128`) build, which supports Blackwell
(`sm_120`) GPUs as well as older sm_50..sm_90 cards. To target a different CUDA
version, change `cu128` in `requirements.txt` to match your driver (see
<https://pytorch.org/get-started/locally/>).

`tools/build_embedded.py` extracts the already-combined viewer (`FINAL_HTML`,
where `Builder.java` merged `archive-search.{html,css,js}`) plus the cities and
OWL-ViT label data from `web/target/indexer.js`, embeds them into a single
self-contained `dist/indexer.py`, and adds that program into the release zip as
`python/indexer.py`. The bundling logic is located only in `Builder.java` (never
duplicated in Python), and `python/` keeps no copy of the `archive-search.*`
files. Pass `--no-zip` to only (re)generate `dist/indexer.py`.

This means **to change the final archive viewer** you edit
`web/src/main/webapp/archive-search.{html,css,js}`, then re-run `mvn clean verify`
(in `web/`) and `python tools/build_embedded.py` (in `python/`); the change flows
into the Python program. `dist/indexer.py` is a generated build artifact
(git-ignored), shipped inside the release zip as `python/indexer.py`.

### Run

```bash
# Index a folder with default settings (same defaults as the web UI)
# -i/--input is required; -o/--output defaults to a timestamped name in the current directory.
python dist/indexer.py -i /path/to/media -o my_archive.html     # Linux/macOS
python dist\indexer.py -i C:\path\to\media -o my_archive.html    # Windows
```

Every web-UI control is available as a command-line parameter with the same
default value:

| CLI flag | Web control | Default |
|----------|-------------|---------|
| `-i/--input` | Folder to Index | (required) |
| `--models` | ML Models checkboxes | all three |
| `--min-probability` | Min. Probability | `55` |
| `--add-preview` | Add preview to index | `true` |
| `--index-video` | Index Video | `true` |
| `--video-indexing-interval` | Video Indexing Interval (ms) | `5000` |
| `--ocr-enabled` | OCR | `true` |
| `--min-ocr-probability` | Min. OCR Probability | `80` |
| `--ocr-languages` | OCR Languages | `eng,fra,nld` |
| `--extract-exif` | Extract EXIF information | `true` |
| `--device` | (WebGPU/WASM backend) | `auto` |
| `--no-status` | (hides the status block) | off |
| `-o/--output` | (the downloaded file) | `<timestamp>_media_archive.html` (in the current directory) |

Run `python dist/indexer.py --help` for the full list.

While indexing in an interactive terminal, a **live status panel** is shown that
stays fixed at the bottom of the screen (it does not scroll) and mirrors the web
UI's status block — total files, files indexed / successful / with error, the
last-10-files status, progress, processing and remaining time, current file,
current operation and the ML backend (CPU/GPU). Log lines scroll above it. The
panel is automatically disabled when the output is redirected to a file or a
pipe, and can be turned off explicitly with `--no-status`.

### Development and Testing

```
python/
├── src/ml_media_archive/indexer.py   # the implementation (logic only; empty data blobs)
├── tools/build_embedded.py           # embeds Maven's output into dist/indexer.py + the zip
├── dist/indexer.py                   # generated, self-contained program (git-ignored)
├── pyproject.toml
├── requirements.txt
└── tests/                            # pytest tests
```

`src/ml_media_archive/indexer.py` holds only the Python *logic*; its embedded
data blobs are empty. `tools/build_embedded.py` (after a Maven build) writes the
ready-to-run, self-contained `dist/indexer.py` — the file shipped in the release
zip as `python/indexer.py`. `python/` keeps no copy of the `web/` archive-search
files, and `dist/` is git-ignored.

The tests load the built `dist/indexer.py` (which has the data embedded), so
build it first (`mvn clean verify` in `web/`, then `python tools/build_embedded.py`).
The data-dependent tests skip with a clear message if `dist/` has not been built.

Run the tests with (Linux/macOS):

```bash
cd python
.venv/bin/python -m pytest -q
```

or on Windows:

```bat
cd python
.\.venv\Scripts\python -m pytest -q
```

- `tests/test_indexer.py` — fast, deterministic unit tests for the logic that
  must match the JavaScript version exactly (geocoding, EXIF date format, box
  normalisation, OWL-ViT label enrichment, archive assembly). No model
  downloads.
- `tests/test_full_indexing_cycle.py` — the Python equivalent of the JavaScript
  `IndexerTest.fullIndexingCycleTest`. It is **disabled by default** (like its
  Java counterpart) and runs the full ML pipeline over the sample media, then
  compares the produced archive's `sourceData` against the reference archive
  with the same shift-tolerant cosine-similarity check. Enable it with
  `MEDIA_ARCHIVE_RUN_FULL_CYCLE=1` (it downloads ~2 GB of models on first run).

---

## Issues and contributions

Please report suggestions, bugs or comments on the GitHub
[issues page](https://github.com/zlelik/ml-media-archive/issues).
