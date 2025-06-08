# Release 2.0.0
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

# Release 1.0.2
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

# Release 1.0.1
## Change Log
* Displaying photos on the map feature has been added.
* Selection of the map region for filtering feature has been added.
* Automatic tests with Selenide/JUnit have been added.
* Code cleanup, especially in the indexes.js.
* Code formatting (most of the files).

# Release 1.0.0

Initial release with many working features.
