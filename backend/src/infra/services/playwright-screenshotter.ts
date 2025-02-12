import { FileSystem } from "@/core/interfaces/file-system.interface";
import { Screenshotter } from "@/core/interfaces/screenshotter.interface";
import { Page } from "playwright";

export class PlaywrightScreenshoter implements Screenshotter {
  constructor(private readonly fileSystem: FileSystem) {}

  async takeScreenshot(page: Page) {
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
