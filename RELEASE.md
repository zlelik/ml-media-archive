# Release 1.0.2

* A bug with more than 200 images displayed on the map was fixed.
* A bug with previous images stayed on the map was fixed.
* Switched to fixed version of AG Grid 33.2.2 instead of latest, because latest stopped working.
* Code cleanup.
* New column "Processing Status" has been added to indicate if image was process fully successfully or is any errors happened.
* Video metadata extraction has been improved by adding more video formats metadata support.
* The bug with problematic/unsupported videos is fixed. Now such videos does not stop the whole indexing process and skipped with the specific record in the "Processing Status" column.
* The test data folder with 23 test images has been added.
* releases folder with zip archive for running the program locally has been added.

# Release 1.0.1

## Changes

* Displaying photos on the map feature has been added.
* Selection of the map region for filtering feature has been added.
* Automatic tests with Selenide/JUnit have been added.
* Code cleanup, especially in the indexes.js.
* Code formatting (most of the files).

# Release 1.0.0

Initial release with many working features.
