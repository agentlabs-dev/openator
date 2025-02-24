export class PlaywrightScreenshoter {
    constructor(fileSystem) {
        this.fileSystem = fileSystem;
    }
    async takeScreenshot(page) {
        const screenshot = await page.screenshot({
            type: "png",
            fullPage: false,
        });
        const url = new URL(page.url());
        const hostname = url.hostname.replace(/[:/]/g, "_");
        const segments = url.pathname
            .split("/")
            .filter((segment) => segment)
            .join("_");
        const key = `${hostname}_${segments}_${crypto.randomUUID()}`;
        const signedUrl = await this.fileSystem.saveScreenshot(key, screenshot);
        return signedUrl;
    }
}
//# sourceMappingURL=playwright-screenshotter.js.map