package app.ml.media.archive;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Matcher;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Class to build the final index.html and indexer.js with all embedded code.
 * It does the following steps:
 * 1. Reads 3 files in memory: archive-search.html, archive-search.css, archive-search.js. These 3 files are not modified, all modifications are done in memory.
 * 2. Removes line comments from archive-search.js.
 * 3. Replaces sourceData variable sample value inside archive-search.js to template value: sourceData={source_data}
 * 4. Replaces css and javacsript (archive-search.js) references inside archive-search.html to their actual values. Make kind of embedded css and javascript.
 * 5. Replaces some special characters inside archive-search.html and make it one-line code, that it is possible to embed it as javascript variable.
 * 6. Reads file indexer.js into memory.
 * 7. Edit FINAL_HTML constant and add value of prepared archive-search.html file there.
 * 8. Save indexer.js file into the disk.
 */
public class Builder {
    
    private static final Logger logger = LoggerFactory.getLogger(Builder.class);

    public static void main(String[] args) throws IOException {
        if (args.length < 1) {
            logger.warn("Usage: Builder <target-directory>");
            System.exit(1);
        }

        Path targetDir = Paths.get(args[0]);
        logger.info("Start building process in: " + targetDir.toAbsolutePath());

        // Read 4 files from target folder
        Path archiveSearchHTMLFile = targetDir.resolve("archive-search.html");
        Path archiveSearchCSSFile = targetDir.resolve("archive-search.css");
        Path archiveSearchJSFile = targetDir.resolve("archive-search.js");
        Path indexerJSFile = targetDir.resolve("indexer.js");
        Path agGridJSFile = targetDir.resolve("ag-grid-community.min-33.2.2.js");
        
        String archiveSearchHTML = Files.readString(archiveSearchHTMLFile, StandardCharsets.UTF_8);
        String archiveSearchCSS = Files.readString(archiveSearchCSSFile, StandardCharsets.UTF_8);
        String archiveSearchJS = Files.readString(archiveSearchJSFile, StandardCharsets.UTF_8);
        String agGridJS = Files.readString(agGridJSFile, StandardCharsets.UTF_8);
        String indexer = Files.readString(indexerJSFile, StandardCharsets.UTF_8);        
        logger.info("Read all required files in memory");
        
        // Comments deletion is removed as it is too complicated and cannot handle some real cases.
        // logger.info("Remove line comments from archive-search.js");
        // archiveSearchJS = Builder.removeLineCommentsAndTrim(archiveSearchJS);
        archiveSearchJS = archiveSearchJS.replace("\n", "").replaceAll("sourceData =.*,DUMMY_REPLACEMENT_CONST = 0", "sourceData={source_data},DUMMY_REPLACEMENT_CONST=0");
        
        // Inline CSS and JS into HTML
        archiveSearchHTML = archiveSearchHTML.replace("<link rel=\"stylesheet\" href=\"archive-search.css\" type=\"text/css\" />", String.format("<style>%s</style>", archiveSearchCSS));
        archiveSearchHTML = archiveSearchHTML.replace("<script src=\"archive-search.js\"></script>", String.format("<script>%s</script>", archiveSearchJS));
        archiveSearchHTML = archiveSearchHTML.replace("<script src=\"ag-grid-community.min-33.2.2.js\"></script>", String.format("<script>%s</script>", agGridJS));

        // Convert to single-line JS-safe string, escape backslashes and single quotes
        archiveSearchHTML = archiveSearchHTML.replace("\\", "\\\\")
                            .replace("\'", "\\\'")
                            .replace("\n", "")
                            .replace("\r", "")
                            .replace("\t", " ");

        logger.info("Prepared one line archive-search.html");
        
        // Update index.html in target folder
        indexer = indexer.replaceFirst("const FINAL_HTML = '.*?';", String.format("const FINAL_HTML = '%s';", Matcher.quoteReplacement(archiveSearchHTML)));

        logger.info("Prepared indexer.js");
        
        // Write back updated file to target folder
        Files.writeString(indexerJSFile, indexer, StandardCharsets.UTF_8);

        logger.info("indexer.js preparation process completed successfully.");
    }
    
    /**
     * This function is not reliable and cannot handle some cases like "'" //comment.
     * It is not in use anymore.
     * @param code
     * @return
     */
    public static String removeLineCommentsAndTrim(String code) {
        StringBuilder result = new StringBuilder();
        boolean inSingleQuote = false;
        boolean inDoubleQuote = false;
        boolean inBacktick = false;

        StringBuilder lineBuffer = new StringBuilder();

        for (int i = 0; i < code.length(); ) {
            char c = code.charAt(i);

            // End of line
            if (c == '\n' || c == '\r') {
                result.append(lineBuffer.toString().trim()).append('\n');
                lineBuffer.setLength(0);
                i++;
                continue;
            }

            // Check for // line comment
            if (!inSingleQuote && !inDoubleQuote && !inBacktick &&
                c == '/' && i + 1 < code.length() && code.charAt(i + 1) == '/') {
                // Skip to end of line
                while (i < code.length() && code.charAt(i) != '\n' && code.charAt(i) != '\r') {
                    i++;
                }
                continue;
            }

            // Track string state
            if (c == '\'' && !inDoubleQuote && !inBacktick) {
                if (!(i > 0 && code.charAt(i - 1) == '\\')) inSingleQuote = !inSingleQuote;
            } else if (c == '"' && !inSingleQuote && !inBacktick) {
                if (!(i > 0 && code.charAt(i - 1) == '\\')) inDoubleQuote = !inDoubleQuote;
            } else if (c == '`' && !inSingleQuote && !inDoubleQuote) {
                if (!(i > 0 && code.charAt(i - 1) == '\\')) inBacktick = !inBacktick;
            }

            lineBuffer.append(c);
            i++;
        }

        // Handle last line if no trailing newline
        if (lineBuffer.length() > 0) {
            result.append(lineBuffer.toString().trim());
        }

        return result.toString();
    }
}
