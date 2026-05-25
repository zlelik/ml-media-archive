package app.ml.media.archive;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class BuilderTest {

    static {
        System.setProperty("org.slf4j.simpleLogger.showDateTime", "true");
        System.setProperty("org.slf4j.simpleLogger.dateTimeFormat", "'['yyyy-MM-dd HH:mm:ss.SSS']'");
        System.setProperty("org.slf4j.simpleLogger.showLogName", "false");
        System.setProperty("org.slf4j.simpleLogger.showThreadName", "false");
        System.setProperty("org.slf4j.simpleLogger.showLogLevel", "false");
    }
    private static final Logger logger = LoggerFactory.getLogger(BuilderTest.class);

    @TempDir
    Path tempDir;

    @Test
    public void testMain() throws IOException {
        logger.info("Test [testMain] started.");
        // Setup mock files
        String version = "1.2.3";
        Files.writeString(tempDir.resolve("archive-search.html"), 
            "<html><head><link rel=\"stylesheet\" href=\"archive-search.css\" type=\"text/css\" />V:X.Y.Z</head><body><script src=\"archive-search.js\"></script><script src=\"ag-grid-community.min-33.2.2.js\"></script></body></html>", StandardCharsets.UTF_8);
        Files.writeString(tempDir.resolve("archive-search.css"), "body { color: red; }", StandardCharsets.UTF_8);
        Files.writeString(tempDir.resolve("archive-search.js"), "sourceData = [],DUMMY_REPLACEMENT_CONST = 0;", StandardCharsets.UTF_8);
        Files.writeString(tempDir.resolve("ag-grid-community.min-33.2.2.js"), "console.log('ag-grid');", StandardCharsets.UTF_8);
        Files.writeString(tempDir.resolve("index.html"), "<html><body>Version: V:X.Y.Z</body></html>", StandardCharsets.UTF_8);
        Files.writeString(tempDir.resolve("indexer.js"), "const FINAL_HTML = '';", StandardCharsets.UTF_8);
        
        logger.info("Test [testMain] mock files have been created.");
        
        // Run main
        Builder.main(new String[]{tempDir.toString(), version});
        
        logger.info("Test [testMain] mock files have been processed.");

        // Verify index.html
        String updatedIndexHTML = Files.readString(tempDir.resolve("index.html"), StandardCharsets.UTF_8);
        assertTrue(updatedIndexHTML.contains("Version: 1.2.3"));

        // Verify indexer.js
        String updatedIndexerJS = Files.readString(tempDir.resolve("indexer.js"), StandardCharsets.UTF_8);
        assertTrue(updatedIndexerJS.contains("const FINAL_HTML = '<html"));
        assertTrue(updatedIndexerJS.contains("Version: 1.2.3"));
        assertTrue(updatedIndexerJS.contains("body { color: red; }")); // CSS inlined
        assertTrue(updatedIndexerJS.contains("sourceData={source_data}")); // JS placeholder updated
        assertTrue(updatedIndexerJS.contains("console.log(\\'ag-grid\\');")); // ag-grid inlined and escaped
        
        logger.info("Test [testMain] finished.");
    }

    @Test
    public void testRemoveLineCommentsAndTrim() {
        logger.info("Test [testRemoveLineCommentsAndTrim] started.");
        String input = "var x = 1; // comment\nvar y = 2; // another comment";
        String expected = "var x = 1;\nvar y = 2;";
        assertEquals(expected, Builder.removeLineCommentsAndTrim(input));

        // Trimming
        input = "  var x = 1;  \n  var y = 2;  ";
        expected = "var x = 1;\nvar y = 2;";
        assertEquals(expected, Builder.removeLineCommentsAndTrim(input));

        // No newline at end
        input = "var x = 1; // comment";
        expected = "var x = 1;";
        assertEquals(expected, Builder.removeLineCommentsAndTrim(input));

        // Comments in strings
        input = "var s1 = \"// not a comment\";\n" +
                "var s2 = '// also not a comment';\n" +
                "var s3 = `// still not a comment`;";
        expected = "var s1 = \"// not a comment\";\n" +
                   "var s2 = '// also not a comment';\n" +
                   "var s3 = `// still not a comment`;";
        assertEquals(expected, Builder.removeLineCommentsAndTrim(input));

        // Escaped quotes
        input = "var s1 = \"String with \\\" // not a comment\"; // but this is\n" +
                "var s2 = 'String with \\' // not a comment'; // and this is";
        expected = "var s1 = \"String with \\\" // not a comment\";\n" +
                   "var s2 = 'String with \\' // not a comment';";
        assertEquals(expected, Builder.removeLineCommentsAndTrim(input));

        // Mixed
        input = "  var a = 1; // comment 1  \n" +
                "  var b = \"http://example.com\"; // comment 2  \n" +
                "  // comment 3  \n" +
                "  var c = 'it\\'s working';  ";
        expected = "var a = 1;\n" +
                   "var b = \"http://example.com\";\n" +
                   "\n" +
                   "var c = 'it\\'s working';";
        assertEquals(expected, Builder.removeLineCommentsAndTrim(input));

        // Empty
        assertEquals("", Builder.removeLineCommentsAndTrim(""));

        // Only comments
        assertEquals("\n", Builder.removeLineCommentsAndTrim("// line 1\n// line 2"));

        // Quote edge cases
        assertEquals("var c = \"'\";", Builder.removeLineCommentsAndTrim("var c = \"'\"; // comment"));
        assertEquals("var x = \"'\"", Builder.removeLineCommentsAndTrim("var x = \"'\" // comment"));
        logger.info("Test [testRemoveLineCommentsAndTrim] finished.");
    }
}
