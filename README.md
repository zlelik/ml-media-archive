# Machine Learning Media Archive

# Introduction
This program is designed to create a searchable archive of the media (photo and video), including object detection with machine learning algorithms. It uses TensorFlow Machine Learning library from google and 2 free models YOLOv8 and EfficiendDet. More models might be added in future. The program calculates the SHA-256 checksum for each file, which is a best practice in the OAIS framework.

Program uses several other free libraries for EXIF data extraction, UI, metadata extraction from videos, Tesseract for OCR, etc.

# Build
Build from command line: `mvn clean package`

# Run
After build `index.html` will be created in the `target` folder. All required files are located in that folder. Open `index.html` in the browser and start index media archive.
Alternatively: this program is available online on my [Blog](https://zlelik.blogspot.com/2025/03/ml-media-archive.html) or on [Glitch](https://ml-media-archive.glitch.me).

NOTE: Recommended browser is FireFox. Program works in Chrome, but Chrome is very aggressive and suspends JavaScript if its window is not active or if computer went to energy saving mode. 

# TODO
- Add more models (Light version of BLIP for image captioning).
- Make exception handling better and avoid program crashing on weird file formats.
- Add filtering by maps and displaying photos on the map.
- Add configurable preview size to save the space for large archives.

Please report any suggestions/bugs/comments on Github.
