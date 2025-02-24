import { Page } from 'playwright';
import { Browser } from '@/core/interfaces/browser.interface';
import { Screenshotter } from '@/core/interfaces/screenshotter.interface';
import { EventBus } from '@/core/services/realtime-reporter';
declare global {
    interface Window {
        getEventListeners?: any;
    }
}
export type Coordinates = {
    x: number;
    y: number;
};
export type TextNode = {
    type: 'TEXT_NODE';
    text: string;
    isVisible: boolean;
};
export type ElementNode = {
    tagName: string | null;
    attributes: Record<string, string>;
    text: string;
    index: number;
    xpath: string | null;
    coordinates: Coordinates | null;
    isVisible: boolean;
    isInteractive: boolean;
    isTopElement: boolean;
    highlightIndex: number;
    children: (DomNode | null)[];
    iframeContext: string;
    shadowRoot: boolean;
};
export type DomNode = TextNode | ElementNode;
export declare const isTextNode: (node: DomNode) => node is TextNode;
export interface SerializedDomState {
    screenshot: string;
    pristineScreenshot: string;
    domState: DomNode | null;
    pixelAbove: number;
    pixelBelow: number;
}
export declare class DomService {
    private readonly screenshotService;
    private readonly browserService;
    private readonly eventBus;
    private domContext;
    constructor(screenshotService: Screenshotter, browserService: Browser, eventBus: EventBus);
    private stringifyDomStateForHash;
    private hashDomState;
    getIndexSelector(index: number): Coordinates | null;
    getDomState(withHighlight?: boolean): Promise<SerializedDomState>;
    getInteractiveElements(withHighlight?: boolean): Promise<{
        screenshot: string;
        pristineScreenshot: string;
        domState: DomNode | null;
        selectorMap: Record<number, DomNode>;
        stringifiedDomState: string;
        domStateHash: string;
        pixelAbove: number;
        pixelBelow: number;
    }>;
    createSelectorMap(nodeState: DomNode | null): Record<number, DomNode>;
    stringifyDomState(nodeState: DomNode | null): string;
    resetHighlightElements(): Promise<void>;
    highlightElementWheel(direction: 'down' | 'up'): Promise<void>;
    highlightElementPointer(coordinates: Coordinates): Promise<void>;
    waitForStability(page: Page): Promise<void>;
    highlightForSoM(withHighlight?: boolean): Promise<DomNode | null>;
}
