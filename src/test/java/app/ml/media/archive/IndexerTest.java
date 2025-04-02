package app.ml.media.archive;

import static com.codeborne.selenide.Condition.clickable;
import static com.codeborne.selenide.Condition.enabled;
import static com.codeborne.selenide.Condition.hidden;
import static com.codeborne.selenide.Condition.visible;
import static com.codeborne.selenide.Selenide.$;
import static com.codeborne.selenide.Selenide.open;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.nio.file.Paths;
import java.util.logging.Level;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
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
    
    
    /**
     * Common tests setup: Setup browser, Chrome options, timeout, etc. 
     */
    @BeforeAll
    static void setup() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--disable-web-security");
        options.addArguments("--allow-file-access-from-files");
        options.addArguments("--disable-site-isolation-trials");
        
        Configuration.browser = "chrome";
        Configuration.headless = true;
        Configuration.pageLoadTimeout = PAGE_LOAD_TIMEOUT;
        Configuration.timeout = ELEMENT_STATE_TIMEOUT;
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
}
