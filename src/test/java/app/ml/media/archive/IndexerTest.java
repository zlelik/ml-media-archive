package app.ml.media.archive;

import static com.codeborne.selenide.Condition.clickable;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.hidden;
import static com.codeborne.selenide.Condition.text;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.$$;
import static com.codeborne.selenide.Selenide.executeJavaScript;
import static com.codeborne.selenide.Selenide.open;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.StandardCopyOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.logging.Level;
import java.util.stream.Stream;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;

import com.codeborne.selenide.Configuration;
import com.codeborne.selenide.SelenideElement;
import com.codeborne.selenide.WebDriverRunner;


/**
 * This is test class to test final HTML/javascript that it is working and does not have any JavaScript and other errors. 
 */
public class IndexerTest {
    private static int PAGE_LOAD_TIMEOUT = 60000;// Milliseconds
    private static int ELEMENT_STATE_TIMEOUT = 60000;// Milliseconds
    private static final Duration LONG_TIMEOUT = Duration.ofMinutes(20);
    
    
    /**
     * Common tests setup: Setup browser, Chrome options, timeout, etc. 
     */
    @BeforeAll
    static void setup() {
        ChromeOptions options = new ChromeOptions();
        Path staticDownloadsDir = Paths.get("target", "selenide-downloads").toAbsolutePath();
        staticDownloadsDir.toFile().mkdirs();
        Map<String, Object> chromePrefs = new HashMap<>();
        chromePrefs.put("download.default_directory", staticDownloadsDir.toString());
        chromePrefs.put("download.prompt_for_download", false);
        chromePrefs.put("download.directory_upgrade", true);
        chromePrefs.put("safebrowsing.enabled", true);
        options.setExperimentalOption("prefs", chromePrefs);
        options.addArguments("--disable-web-security");
        options.addArguments("--allow-file-access-from-files");
        options.addArguments("--disable-site-isolation-trials");
        
        Configuration.browser = "chrome";
        Configuration.headless = true;
        Configuration.pageLoadTimeout = PAGE_LOAD_TIMEOUT;
        Configuration.timeout = ELEMENT_STATE_TIMEOUT;
        Configuration.downloadsFolder = staticDownloadsDir.toString();
        Configuration.browserCapabilities = options;
    }
    
    /**
     * Find the required HTML file and open it. 
     */
    @BeforeEach
    void setUp() {
        String filePath = Paths.get("target", "index.html").toAbsolutePath().toUri().toString();
        open(filePath);
    }
    
    /**
     * Test for JavaScript errors.
     */
    @Test
    public void indexerNoJSErrorsTest() {
        WebDriver driver = WebDriverRunner.getWebDriver();
        LogEntries logs = driver.manage().logs().get(LogType.BROWSER);

        // Check if there are any JavaScript errors
        boolean hasJavaScriptError = false;
        String errorText = "";
        for (LogEntry log : logs) {
            if (log.getLevel() == Level.SEVERE) {
                // If there is a severe log (JavaScript error), mark as error
                hasJavaScriptError = true;
                errorText = log.getMessage();
            }
        }

        // Assert that no JavaScript errors were found
        assertFalse(hasJavaScriptError, String.format("There are JavaScript errors [%s] in the console .", errorText));
    }

    
    /**
     * Test that start button becomes enabled, visible, clickable and loading layer is hidden.
     * Usually it means all the external JavaScript are loaded and page is ready for user.
     */
    @Test
    public void startButtonAvailabilityTest() {
        SelenideElement button = $("button#start_btn");
        SelenideElement loadingEl = $("#loading_el");
        
        button.shouldBe(enabled).shouldBe(visible).shouldBe(clickable);
        loadingEl.shouldBe(hidden);
    }
    
    /**
     * Full indexing cycle end-to-end test.
     * <p>
     * Disabled by default; enable with -DfullIndexingCycleTest=true.
     */
    @Test
    @Tag("slow")
    @EnabledIfSystemProperty(named = "fullIndexingCycleTest", matches = "true")
    public void fullIndexingCycleTest() throws Exception {
        ensureBuildOutputExists();

        Path targetDir = Paths.get("target").toAbsolutePath();
        Path testMediaDir = targetDir.resolve("test-media");
        Path expectedArchiveDir = targetDir.resolve("test-archive");
        Path downloadsDir = targetDir.resolve("selenide-downloads");

        copyDirectory(Paths.get("src/test/resources/test-media"), testMediaDir);
        copyDirectory(Paths.get("src/test/resources/test-archive"), expectedArchiveDir);
        recreateDirectory(downloadsDir);

        Configuration.downloadsFolder = downloadsDir.toString();

        open(targetDir.resolve("index.html").toUri().toString());

        SelenideElement button = $("button#start_btn");
        SelenideElement loadingEl = $("#loading_el");
        button.shouldBe(enabled).shouldBe(visible).shouldBe(clickable);
        loadingEl.shouldBe(hidden);

        selectAllModelCheckboxes();
        selectLanguages("eng", "fra", "nld");

        long mediaFileCount;
        try (Stream<Path> mediaPathStream = Files.walk(testMediaDir)) {
            mediaFileCount = mediaPathStream.filter(Files::isRegularFile).count();
        }
        $("#file_selector").uploadFile(testMediaDir.toFile());
        $("#file_count").shouldHave(text(String.valueOf(mediaFileCount)));

        Instant startTime = Instant.now();
        button.click();

        closeOfflineDialogIfPresent();
        button.shouldBe(enabled, LONG_TIMEOUT);

        Path downloadedArchive = waitForDownloadedHtml(downloadsDir, startTime, LONG_TIMEOUT);
        Path expectedArchive = expectedArchiveDir.resolve("ml-media-archive-test.html");

        assertArchivesEqualWithSourceDataTolerance(expectedArchive, downloadedArchive);
    }

    private static void ensureBuildOutputExists() throws Exception {
        Path indexFile = Paths.get("target", "index.html");
        if (Files.exists(indexFile)) {
            return;
        }

        Process process = new ProcessBuilder("mvn", "-DskipTests", "process-test-classes")
            .redirectErrorStream(true)
            .start();
        int exitCode = process.waitFor();
        assertEquals(0, exitCode, "Build command failed while preparing target/index.html");
        assertTrue(Files.exists(indexFile), "target/index.html still does not exist after build command");
    }

    private static void copyDirectory(Path source, Path destination) throws IOException {
        recreateDirectory(destination);

        Files.walkFileTree(source, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                Path targetDir = destination.resolve(source.relativize(dir));
                Files.createDirectories(targetDir);
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                Path targetFile = destination.resolve(source.relativize(file));
                Files.copy(file, targetFile, StandardCopyOption.REPLACE_EXISTING);
                return FileVisitResult.CONTINUE;
            }
        });
    }

    private static void recreateDirectory(Path directory) throws IOException {
        if (Files.exists(directory)) {
            Files.walk(directory)
                .sorted(Comparator.reverseOrder())
                .map(Path::toFile)
                .forEach(File::delete);
        }
        Files.createDirectories(directory);
    }

    private static void selectAllModelCheckboxes() {
        SelenideElement modelsParent = $("#ml_models");
        modelsParent.shouldBe(visible);

        List<SelenideElement> checkboxes = new ArrayList<>();
        for (SelenideElement checkbox : modelsParent.$$("input[type='checkbox']").asFixedIterable()) {
            checkboxes.add(checkbox);
        }
        assertFalse(checkboxes.isEmpty(), "No model checkboxes found in #ml_models");
        for (SelenideElement checkbox : checkboxes) {
            String id = checkbox.getAttribute("id");
            ensureCheckboxSelected(id);
        }
    }

    private static void selectLanguages(String... langCodes) {
        for (String langCode : langCodes) {
            ensureCheckboxSelected(langCode);
        }
    }

    private static void ensureCheckboxSelected(String checkboxId) {
        SelenideElement input = $("#" + checkboxId);
        if (input.isSelected()) {
            return;
        }

        SelenideElement label = $("label[for='" + checkboxId + "']");
        if (label.exists()) {
            label.scrollTo().click();
        } else {
            executeJavaScript(
                "const cb = document.getElementById(arguments[0]); if (cb) { cb.checked = true; $(cb).checkboxradio('refresh'); cb.dispatchEvent(new Event('change', { bubbles: true })); }",
                checkboxId
            );
        }

        assertTrue($("#" + checkboxId).isSelected(), "Checkbox was not selected: " + checkboxId);
    }

    private static void closeOfflineDialogIfPresent() {
        try {
            $$(".ui-dialog-buttonset button")
                .findBy(text("OK"))
                .shouldBe(clickable, Duration.ofMinutes(8))
                .click();
        } catch (Throwable ignored) {
            // Dialog may already be auto-closed by timeout or not shown due browser behavior.
        }
    }

    private static Path waitForDownloadedHtml(Path downloadsDir, Instant startTime, Duration timeout) throws Exception {
        Instant deadline = Instant.now().plus(timeout);
        while (Instant.now().isBefore(deadline)) {
            List<Path> htmlFiles = new ArrayList<>();
            try (Stream<Path> paths = Files.list(downloadsDir)) {
                paths.filter(path -> path.getFileName().toString().endsWith(".html"))
                    .filter(path -> !path.getFileName().toString().endsWith(".crdownload"))
                    .forEach(htmlFiles::add);
            }

            if (!htmlFiles.isEmpty()) {
                Path latest = htmlFiles.stream()
                    .max(Comparator.comparingLong(path -> path.toFile().lastModified()))
                    .orElseThrow();

                if (Files.getLastModifiedTime(latest).toInstant().isAfter(startTime.minusSeconds(2))) {
                    return latest;
                }
            }

            Thread.sleep(1000);
        }

        throw new AssertionError("Downloaded HTML file was not found in " + downloadsDir + " within timeout " + timeout);
    }

    private static void assertArchivesEqualWithSourceDataTolerance(Path expectedArchivePath, Path actualArchivePath) throws IOException {
        String expected = Files.readString(expectedArchivePath, StandardCharsets.UTF_8);
        String actual = Files.readString(actualArchivePath, StandardCharsets.UTF_8);

        if (expected.equals(actual)) {
            return;
        }

        Pattern pattern = Pattern.compile("(?s)^(.*?sourceData\\s*=\\s*)(.*?)(,\\s*DUMMY_REPLACEMENT_CONST\\s*=\\s*0.*)$");
        Matcher expectedMatcher = pattern.matcher(expected);
        Matcher actualMatcher = pattern.matcher(actual);

        assertTrue(expectedMatcher.matches(), "Expected archive does not contain expected sourceData section");
        assertTrue(actualMatcher.matches(), "Actual archive does not contain expected sourceData section");

        assertEquals(expectedMatcher.group(1), actualMatcher.group(1), "Archive prefix before sourceData differs");
        assertEquals(expectedMatcher.group(3), actualMatcher.group(3), "Archive suffix after sourceData differs");

        String expectedSourceData = expectedMatcher.group(2);
        String actualSourceData = actualMatcher.group(2);
        assertSmallDifference(expectedSourceData, actualSourceData);
    }

    private static void assertSmallDifference(String expected, String actual) {
        int maxLength = Math.max(expected.length(), actual.length());
        int minLength = Math.min(expected.length(), actual.length());

        int mismatchCount = Math.abs(expected.length() - actual.length());
        for (int i = 0; i < minLength; i++) {
            if (expected.charAt(i) != actual.charAt(i)) {
                mismatchCount++;
            }
        }

        double diffRatio = maxLength == 0 ? 0.0 : (double) mismatchCount / (double) maxLength;
        assertTrue(diffRatio <= 0.01 || mismatchCount <= 500,
            "sourceData differs too much. mismatchCount=" + mismatchCount + ", diffRatio=" + diffRatio);
    }
}
