import { VariableString } from '@/core/entities/variable-string';
import { Browser } from '@/core/interfaces/browser.interface';
import { Page } from 'playwright';
export type Coordinates = {
    x: number;
    y: number;
};
export declare class ChromiumBrowser implements Browser {
    private options?;
    private page;
    private context;
    private minimumPageLoadTime;
    constructor(options?: {
        headless: boolean;
        wsEndpoint?: string;
    });
    launch(url: string): Promise<void>;
    private waitForDomContentLoaded;
    private waitMinimumPageLoadTime;
    private waitForStability;
    getStablePage(): Promise<Page>;
    close(): Promise<void>;
    getPage(): Page;
    getPageUrl(): string;
    mouseClick(x: number, y: number): Promise<void>;
    getPixelAbove(): Promise<number>;
    getPixelBelow(): Promise<number>;
    fillInput(text: VariableString, coordinates: Coordinates): Promise<void>;
    scrollDown(): Promise<void>;
    scrollUp(): Promise<void>;
    goToUrl(url: string): Promise<void>;
    goBack(): Promise<void>;
    extractContent(): Promise<string>;
}
