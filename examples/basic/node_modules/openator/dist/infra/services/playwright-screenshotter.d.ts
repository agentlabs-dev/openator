import { FileSystem } from "@/core/interfaces/file-system.interface";
import { Screenshotter } from "@/core/interfaces/screenshotter.interface";
import { Page } from "playwright";
export declare class PlaywrightScreenshoter implements Screenshotter {
    private readonly fileSystem;
    constructor(fileSystem: FileSystem);
    takeScreenshot(page: Page): Promise<string>;
}
