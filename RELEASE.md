# Release Notes

## ML Media Archive

This document describes the changes for each version.

# 3.0.0

Major release: the repository now hosts **two parallel implementations** of the
ML Media Archive indexer plus the assets they share.

## Change Log

- Restructured the repository into three top-level folders:
  - `web/` — the original HTML + JavaScript application (Maven build, Selenide
    tests). Its behaviour is unchanged; only its location moved.
  - `python/` — a **new command-line Python implementation** that produces the
    same self-contained, searchable HTML archive. It uses Hugging Face
    `transformers` (DETR-ResNet-50, OWL-ViT and Florence-2) and Tesseract OCR,
    runs on the **GPU when available and falls back to the CPU** otherwise, works
    on Windows and Linux, and exposes every web-UI control as a command-line
    parameter with the same defaults. The whole program ships as a single
    self-contained `indexer.py`.
  - `shared/` — sample test data, release archives, demo page and model files.
- The release archive `release_3.0.0.zip` now contains a `web/` folder (the
  built HTML+JavaScript app) and a `python/` folder (the Python app), plus
  `README.md` and `RELEASE.md`.
- Updated the Azure and GitHub build pipelines for the new `web/` location so
  the JavaScript build keeps working as before.
- Bumped the version from 2.0.17 to 3.0.0 (`web/pom.xml`,
  `python/pyproject.toml`). The Python `transformers` dependency is kept in line
  with the Transformers.js 3.7.2 the web app uses (`transformers` 4.45+).

## Previous releases (2.0.0 → 3.0.0)

The 2.0.x line after 2.0.0 implemented and fixed seven user-reported issues
([#3–#9](https://github.com/zlelik/ml-media-archive/issues?q=is%3Aissue+state%3Aclosed))
along with related improvements and bug fixes:

- **2.0.4** — *Issue #3*: cache already-indexed files in the browser so a long
  indexing run can be stopped and resumed later instead of restarting from
  scratch.
- **2.0.10** — *Issue #4*: show the number of cached items and the first file's
  path in the "use cache" confirmation dialog. *Issue #5*: fix the remaining-time
  estimate when some items are restored from cache (only the items still to be
  processed are counted).
- **2.0.12** — *Issue #6*: in archive view mode, let the user choose which
  detected objects to highlight on the image (helpful when many overlapping
  objects are detected). The cities database is now always loaded from
  jsDelivr (static data), saving traffic on Azure/GitHub hosting.
- **2.0.13** — *Issue #8*: first version of the multiple-archive HTML
  merger/updater tool, and the list of detected objects for a video is shown in
  a de-duplicated, YouTube-style format.
- **2.0.15** — *Issue #9*: fix OCR crashing when processing 100+ photos by
  upgrading Tesseract.js from 2.1.1 to 6.0.1. 
- **2.0.16 / 2.0.17** — *Issue #7*: in archive search, highlight detected objects
  on the video and allow navigating to the point in the video where each object
  was found; numerous pop-up layout/scrolling fixes for the archive viewer. 
  Fixed two GPS bugs (western-hemisphere coordinates and GPS extraction from video).
  Added a version-number display, an automated Selenide end-to-end test for the
  indexing module (with a shift-tolerant `sourceData` comparison), logging, and
  static-code-analysis Maven plugins (JaCoCo, PMD, SpotBugs).

# 2.0.0
## Change Log
* Switched to Transfromers.js from Hugging Face ([Issue #2](https://github.com/zlelik/ml-media-archive/issues/2)).
* 3 models are in use now: 2 for object detection and 1 for image captioning. Details can be found in the [Issue #2](https://github.com/zlelik/ml-media-archive/issues/2).
* TensorFlow and old models have been deleted. New models are loaded directly from Hugging Face website.
* Fallback to CPU has been added if GPU is not available. NOTE: CPU can be 10-100 times slower than GPU.
* Added new column Description into the grid. It can be see in the grid and in the preview.
* AG Grid 33.2.2 is not included and works offline. Prepared archive works offline except maps.
* Build process has been changed via custom Java class instead of Antrun plugin and outdated minify-maven-plugin JavaScript minification plugin. Dependency to minify-maven-plugin plugin has been removed.
* CSS styles and design unification for popup windows in the final archive html.
* Full image and video are used if preview is not available. Also, if preview is available, then still there is an option to use full image/video.
* Screen lock prevention mechanism has been added as screen lock leads to stopping all JavaScript by the Google Chrome Browser.

## System Requirements

There are no strict system requirements, but the notes below might give a better idea of what to expect on a specific machine. Also, there are some notes where it was tested:
* The rule of thumb: the model size multiplied by 2 amount of VRAM (video memory in GPU) is required. If all 3 models are selected, then the size of all 3 models together has to be taken into account for required resource calculation.
* It was tested on Google Chrome Browser with Intel i7 CPU, 16GB RAM, NVIDIA GeForce GTX 1650 GPU 4GB Video Memory.
* It was tested on Firefox with the same hardware does not work in GPU mode, only in CPU mode which is 10 times slower than GPU mode.
* Other configurations/hardware was not tested but might be tested in future.
* Minimum expected (not exactly tested) requirements:
    * To run all 3 models 2GB of video memory in GPU mode is required or 4GB RAM in CPU mode.
    * To run one single model, for example, smallest Xenova\detr-resnet-50 0.5GB of video memory in GPU mode or 2GB RAM in CPU mode.

# 1.0.2
## Change Log
* A bug with more than 200 images displayed on the map was fixed.
* A bug with previous images stayed on the map was fixed.
* Switched to fixed version of AG Grid 33.2.2 instead of latest, because latest stopped working.
* Code cleanup.
* New column "Processing Status" has been added to indicate if image was process fully successfully or is any errors happened.
* Video metadata extraction has been improved by adding more video formats metadata support.
* The bug with problematic/unsupported videos is fixed. Now such videos do not stop the whole indexing process and skipped with the specific record in the "Processing Status" column.
* The test data folder with 23 test images has been added.
* Releases folder with zip archive for running the program locally has been added.
* Models were added: YOLOv8 and EfficientDet.
  
  Original source for YOLOv8: [https://github.com/ultralytics/ultralytics/tree/v8.2.94](https://github.com/ultralytics/ultralytics/tree/v8.2.94)
  
  Original source for EfficientDet: [https://www.kaggle.com/models/tensorflow/efficientdet/tensorFlow2/](https://www.kaggle.com/models/tensorflow/efficientdet/tensorFlow2/)

# 1.0.1
## Change Log
* Displaying photos on the map feature has been added.
* Selection of the map region for filtering feature has been added.
* Automatic tests with Selenide/JUnit have been added.
* Code cleanup, especially in the indexes.js.
* Code formatting (most of the files).

# 1.0.0

Initial release with many working features.
