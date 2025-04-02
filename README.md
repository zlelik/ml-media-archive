# Machine Learning Media Archive

# Introduction
This program is designed to create a searchable archive of media (photos and videos), incorporating object detection using machine learning algorithms. It utilizes TensorFlow, a machine learning library from Google, along with two free models: YOLOv8 and EfficientDet. Additional models may be added in the future.

The program computes the SHA-256 checksum for each file, adhering to best practices in the OAIS framework.

It also leverages several other free libraries for tasks such as EXIF data extraction, UI development, metadata extraction from videos, and Tesseract for OCR.

The program is fully local, requiring no server.

# Build
Build from command line: `mvn clean package`

# Run
After the build, the `index.html` file will be created in the `target` folder, along with all required files. Open `index.html` in your browser to start the media archive indexing module.

Alternatively, this program is available online on my [Blog](https://zlelik.blogspot.com/2025/03/ml-media-archive.html) or on [Glitch](https://ml-media-archive.glitch.me).

NOTE: The recommended browser is Firefox. While the program works in Chrome, Chrome tends to be more aggressive and may suspend JavaScript if its window is inactive or if the computer enters energy-saving mode. Though, Chrome supports more odd formats.

# Development and Testing
- Modify or run `src\main\webapp\index.html` along with the related JavaScript/CSS for the indexing module.
- Modify or run `src\main\webapp\archive-search.html` along with the related JavaScript/CSS for the search module.

The two files mentioned above are fully functional and already contain some test data. The build process will minify and merge all required files.

# TODO
- Add more models (e.g., a lightweight version of BLIP for image captioning).
- Improve exception handling to prevent the program from crashing due to odd file formats.
- Add filtering by maps and display photos on the map.
- Implement a configurable preview size to save space for large archives.
- Enhance the build process with a more modern Maven minify plugin.
- ~~Implement automatic tests using Selenide/JUnit (DONE).~~

Please report any suggestions, bugs, or comments on GitHub.
