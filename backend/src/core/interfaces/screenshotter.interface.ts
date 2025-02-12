import { Page } from "playwright";

export interface Screenshotter {
  takeScreenshot(page: Page): Promise<string>;
}
