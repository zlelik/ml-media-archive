# Machine Learning Media Archive

# Introduction
This program is designed to create a searchable archive of media (photos and videos), incorporating object detection using machine learning algorithms. It utilizes TensorFlow, a machine learning library from Google, along with two free models: YOLOv8 and EfficientDet. Additional models may be added in the future.

The program computes the SHA-256 checksum for each file, adhering to best practices in the OAIS framework.

It also leverages several other free libraries for tasks such as EXIF data extraction, UI development, metadata extraction from videos, and Tesseract for OCR.

The program is fully local, requiring no server.

# Models

Starting from version 2.0.0 three Hugging Face Machine Learning models are used: Xenova\detr-resnet-50, Xenova\owlvit-base-patch32 and Florence-2-base.

All timings below were measured/tested on this GPU: NVIDIA GeForce GTX 1650 GPU 4GB Video Memory and PC with 16GB RAM and Intel i7 CPU.

* Xenova\detr-resnet-50 - called DETR50 in UI. This model is the smallest (around 165MB), the fastest and can do object detection. Total number of objects/categories which model can detect is 90 and the full list can be found in the project folder here `models\Xenova\detr-resnet-50\labels.txt`. The model takes around 1 second to detect the objects on 5 Megapixels image. Original source for this model: [ https://huggingface.co/Xenova/detr-resnet-50]( https://huggingface.co/Xenova/detr-resnet-50)
* Xenova\owlvit-base-patch32 - called OWL-ViT in UI. This model is quite big (around 615MB) and slower, but can detect objects with any number of objects/categories. Total number of objects, which this model can detect in this program is 1203 and the full list can be found in the project folder here `models\Xenova\owlvit-base-patch32\labels.txt`. These 1203 labels came from here [https://www.lvisdataset.org/dataset](https://www.lvisdataset.org/dataset). The model takes around 20 second to detect the objects on 5 Megapixels image. Original source for this model: [https://huggingface.co/Xenova/owlvit-base-patch32](https://huggingface.co/Xenova/owlvit-base-patch32).
* Florence-2-base - called Florence 2 in UI. This model is quite big (around 646MB) but it can produce nice image description almost as good as ChatGPT. The model takes around 10 second to generate image description on 5 Megapixels image. The model only applicable to photos, not videos. Program automatically skips the video for this model. Original source for this model: [https://huggingface.co/onnx-community/Florence-2-base](https://huggingface.co/onnx-community/Florence-2-base).


Prior to version 2.0.0 two Machine Learning models were used: YOLOv8 and EfficientDet.

Original source for YOLOv8: [https://github.com/ultralytics/ultralytics/tree/v8.2.94](https://github.com/ultralytics/ultralytics/tree/v8.2.94)

Original source for EfficientDet: [https://www.kaggle.com/models/tensorflow/efficientdet/tensorFlow2/](https://www.kaggle.com/models/tensorflow/efficientdet/tensorFlow2/)

YOLOv8 was converted from *.pt format (PyTorch Model Format) to TensorFlow.js format.

EfficiendDet was converted from *.pb (TensorFlow Model Format) to TensorFlow.js format.

# Build
Build from command line

`mvn clean verify` - compile, build, run tests and delete all temporary files including test reports.

`mvn clean package` - compile, build, run tests and keep all temporary files including test reports.

# Run
After the build, the `index.html` file will be created in the `target` folder, along with all required files. Open `index.html` in your browser to start the media archive indexing module.

Alternatively, this program is available online on my [Blog](https://zlelik.blogspot.com/2025/03/ml-media-archive.html) or on [Glitch](https://ml-media-archive.glitch.me).

NOTE: The recommended browser is Firefox. While the program works in Chrome, Chrome tends to be more aggressive and may suspend JavaScript if its window is inactive or if the computer enters energy-saving mode. Though, Chrome supports more odd formats.

# Development and Testing
- Modify or run `src\main\webapp\index.html` along with the related JavaScript/CSS for the indexing module.
- Modify or run `src\main\webapp\archive-search.html` along with the related JavaScript/CSS for the search module.

The two files mentioned above are fully functional and already contain some test data. The build process will minify and merge all required files.

# TODO
- Enhance the build process with a more modern Maven minify plugin.
- Add more models (e.g., a lightweight version of BLIP for image captioning).
- Improve exception handling to prevent the program from crashing due to odd file formats.
- Implement a configurable preview size to save space for large archives.

Please report any suggestions, bugs, or comments on GitHub.
