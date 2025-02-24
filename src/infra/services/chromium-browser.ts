import { VariableString } from '@/core/entities/variable-string';
import { Browser } from '@/core/interfaces/browser.interface';
import { convertHtmlToMarkdown } from 'dom-to-semantic-markdown';
import { JSDOM } from 'jsdom';
import {
  Browser as PBrowser,
  BrowserContext,
  Page,
  chromium,
} from 'playwright';

export type Coordinates = {
  x: number;
  y: number;
};

export class ChromiumBrowser implements Browser {
  private page: Page | null = null;
  private context: BrowserContext | null = null;

  private minimumPageLoadTime: number = 400;

  constructor(
    private options?: {
      headless: boolean;
      wsEndpoint?: string;
    },
  ) {}

  async launch(url: string) {
    const wsEndpoint =
      this.options?.wsEndpoint ?? process.env.PLAYWRIGHT_WS_ENDPOINT ?? null;

    let browser: PBrowser;

    /**
     * If the wsEndpoint is provided, we connect to the browser using the Playwright
     * WebSocket endpoint.
     * This is used in the docker-compose file where the playwright-server is running in a dedicated container.
     */
    if (wsEndpoint) {
      browser = await chromium.connectOverCDP(wsEndpoint);
    } else {
      browser = await chromium.launch({
        headless: this.options?.headless ?? false,
      });
    }

    this.context = await browser.newContext({
      screen: {
        width: 1440,
        height: 900,
      },
      viewport: {
        width: 1440,
        height: 900,
      },
    });
    this.page = await this.context.newPage();
    await this.page.goto(url);
  }

  private async waitForDomContentLoaded() {
    await this.getPage().waitForLoadState('domcontentloaded');
  }

  private async waitMinimumPageLoadTime() {
    return new Promise((resolve) =>
      setTimeout(resolve, this.minimumPageLoadTime),
    );
  }

  private async waitForStability() {
    return Promise.all([
      this.waitForDomContentLoaded(),
      this.waitMinimumPageLoadTime(),
    ]);
  }

  async getStablePage(): Promise<Page> {
    await this.waitForStability();
    return this.getPage();
  }

  async close() {
    if (this.context) {
      this.context.close();
    }
  }

  getPage(): Page {
    if (!this.page) {
      throw new Error('The page is not initialized or has been detroyed.');
    }
    return this.page;
  }

  getPageUrl() {
    return this.getPage().url();
  }

  async mouseClick(x: number, y: number) {
    await Promise.all([
      this.getPage().mouse.click(x, y),
      this.getPage().waitForLoadState('domcontentloaded'),
    ]);
  }

  async getPixelAbove() {
    return this.getPage().evaluate(() => {
      return window.scrollY;
    });
  }

  async getPixelBelow() {
    return this.getPage().evaluate(() => {
      return window.scrollY + window.innerHeight;
    });
  }

  async fillInput(text: VariableString, coordinates: Coordinates) {
    await this.getPage().mouse.click(coordinates.x, coordinates.y);
    await this.getPage().keyboard.press('ControlOrMeta+A');
    await this.getPage().keyboard.press('Backspace');
    await this.getPage().keyboard.type(text.dangerousValue(), { delay: 100 });
  }

  async scrollDown() {
    await this.getPage().mouse.wheel(0, 500);
    await this.getPage().waitForTimeout(300);
  }

  async scrollUp() {
    await this.getPage().mouse.wheel(0, -500);
    await this.getPage().waitForTimeout(300);
  }

  async goToUrl(url: string) {
    await this.getPage().goto(url);
  }

  async goBack() {
    await this.getPage().goBack();
  }

  async extractContent() {
    const html = await this.getPage().content();
    const dom = new JSDOM(html);
    const markdown = convertHtmlToMarkdown(html, {
      overrideDOMParser: new dom.window.DOMParser(),
      extractMainContent: true,
    });
    return markdown;
  }
}
