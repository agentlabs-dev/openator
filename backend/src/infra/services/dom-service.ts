import { Page } from 'playwright';
import { Browser } from '@/core/interfaces/browser.interface';
import { Screenshotter } from '@/core/interfaces/screenshotter.interface';
import * as crypto from 'crypto';

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

const isElementNode = (node: DomNode | null): node is ElementNode => {
  if (!node) return false;

  return !('type' in node) || node.type !== 'TEXT_NODE';
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

const IMPORTANT_ATTRIBUTES = [
  'id',
  'name',
  'value',
  'placeholder',
  'aria-label',
  'role',
  'for',
  'href',
  'alt',
  'title',
  'data-testid',
  'data-test',
  'data-test-id',
  'data-test-name',
  'data-test-value',
];

export type DomNode = TextNode | ElementNode;

export const isTextNode = (node: DomNode): node is TextNode => {
  return 'type' in node && node.type === 'TEXT_NODE';
};

export interface SerializedDomState {
  screenshot: string;
  domState: DomNode | null;
}

export class DomService {
  private domContext: {
    selectorMap: Record<number, DomNode>;
  } = {
    selectorMap: {},
  };

  constructor(
    private readonly screenshotService: Screenshotter,
    private readonly browserService: Browser,
  ) {}

  /**
   * For this version of the dom state string with only keep the index and tag name
   * because it is frequent that an attribute or the content of the node changes
   * and we don't want to re-run the action for such a small change.
   *
   * Ouput format: [2]__<div></div>
   */
  private stringifyDomStateForHash(nodeState: DomNode | null) {
    const items: string[] = [];

    const format = (node: DomNode | null) => {
      if (!isElementNode(node)) {
        return;
      }

      if (node.highlightIndex) {
        // [2]__<div></div>
        const str = `[${node.isInteractive ? node.highlightIndex : ''}]__<${node.tagName}>`;

        items.push(str);
      }

      for (const child of node.children) {
        if (child) {
          format(child);
        }
      }
    };

    format(nodeState);

    return items.join('\n');
  }

  private hashDomState(domState: DomNode | null) {
    if (!domState) {
      return '';
    }

    const domStateString = this.stringifyDomStateForHash(domState);

    return crypto.createHash('sha256').update(domStateString).digest('hex');
  }

  getIndexSelector(index: number): Coordinates | null {
    const domNode = this.domContext?.selectorMap[index];

    if (!domNode) {
      return null;
    }

    if (isTextNode(domNode)) {
      return null;
    }

    return domNode.coordinates;
  }

  async getDomState(
    withHighlight: boolean = true,
  ): Promise<SerializedDomState> {
    const state = await this.highlightForSoM(withHighlight);
    const screenshot = await this.screenshotService.takeScreenshot(
      await this.browserService.getStablePage(),
    );

    return { screenshot, domState: state };
  }

  async getInteractiveElements(withHighlight: boolean = true) {
    const { screenshot, domState } = await this.getDomState(withHighlight);
    const selectorMap = this.createSelectorMap(domState);
    const stringifiedDomState = this.stringifyDomState(domState);
    const domStateHash = this.hashDomState(domState);

    this.domContext.selectorMap = selectorMap;

    return {
      screenshot,
      domState,
      selectorMap,
      stringifiedDomState,
      domStateHash,
    };
  }

  createSelectorMap(nodeState: DomNode | null) {
    const selectorMap: Record<number, DomNode> = {};

    const mapNode = (node: DomNode | null) => {
      if (isElementNode(node)) {
        selectorMap[node.highlightIndex] = node;

        for (const child of node.children) {
          mapNode(child);
        }
      }
    };

    mapNode(nodeState);
    return selectorMap;
  }

  stringifyDomState(nodeState: DomNode | null) {
    const items: string[] = [];

    const format = (node: DomNode | null) => {
      if (!isElementNode(node)) {
        return;
      }

      const attributes = Object.entries(node.attributes)
        .filter(([key]) => IMPORTANT_ATTRIBUTES.includes(key))
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');

      if (node.highlightIndex) {
        // [2]__<div optional-attributes>Hello</div>
        const str = `[${node.isInteractive ? node.highlightIndex : ''}]__<${node.tagName} ${attributes}>${node.text}</${node.tagName}>`;

        items.push(str);
      }

      for (const child of node.children) {
        if (child) {
          format(child);
        }
      }
    };

    format(nodeState);

    return items.join('\n');
  }

  async resetHighlightElements() {
    const page = await this.browserService.getStablePage();
    await page.evaluate(() => {
      try {
        // Remove the highlight container and all its contents
        const container = document.getElementById(
          'playwright-highlight-container',
        );
        if (container) {
          container.remove();
        }

        // Remove highlight attributes from elements
        const highlightedElements = document.querySelectorAll(
          '[magic-inspector-highlight-id^="playwright-highlight-"]',
        );
        highlightedElements.forEach((el) => {
          el.removeAttribute('magic-inspector-highlight-id');
        });
      } catch (e) {
        console.error('Failed to remove highlights:', e);
      }
    });
  }

  async highlightElementWheel(direction: 'down' | 'up') {
    const page = await this.browserService.getStablePage();
    await page.evaluate((direction: 'down' | 'up') => {
      console.log('highlightElementWheel', direction);
    }, direction);
  }

  async highlightElementPointer(coordinates: Coordinates) {
    const page = await this.browserService.getStablePage();
    await page.evaluate((coordinates: Coordinates) => {
      try {
        // Create or get highlight container
        let container = document.getElementById(
          'playwright-pointer-highlight-container',
        );
        if (!container) {
          container = document.createElement('div');
          container.id = 'playwright-pointer-highlight-container';
          container.style.position = 'fixed';
          container.style.pointerEvents = 'none';
          container.style.top = '0';
          container.style.left = '0';
          container.style.width = '100%';
          container.style.height = '100%';
          container.style.zIndex = '2147483647'; // Maximum z-index value
          document.body.appendChild(container);
        }

        // Create the red circle
        const circle = document.createElement('div');
        circle.style.position = 'absolute';
        circle.style.width = '20px';
        circle.style.height = '20px';
        circle.style.borderRadius = '50%';
        circle.style.backgroundColor = 'red';
        circle.style.left = `${coordinates.x - 10}px`; // Center the circle
        circle.style.top = `${coordinates.y - 10}px`; // Center the circle
        circle.style.pointerEvents = 'none'; // Ensure it doesn't interfere with clicking

        container.appendChild(circle);

        setTimeout(() => {
          circle.remove();
          container.remove();
        }, 2000);
      } catch (e) {
        console.error('Failed to draw highlight circle:', e);
      }
    }, coordinates);
  }

  async waitForStability(page: Page) {
    await page.waitForTimeout(1500);
  }

  async highlightForSoM(
    withHighlight: boolean = true,
  ): Promise<DomNode | null> {
    try {
      const page: Page = await this.browserService.getStablePage();

      if (page.isClosed()) {
        return null;
      }

      await this.waitForStability(page);

      const domState: DomNode | null = await page.evaluate((withHighlight) => {
        const doHighlightElements = true;
        const focusHighlightIndex = -1;
        const viewportExpansion: 0 | -1 = 0;

        let highlightIndex = 0;

        function highlightElement(
          element: Element,
          index: number,
          parentIframe: HTMLIFrameElement | null = null,
        ) {
          if (!withHighlight) {
            return;
          }

          let container = document.getElementById(
            'playwright-highlight-container',
          );
          if (!container) {
            container = document.createElement('div');
            container.id = 'playwright-highlight-container';
            container.style.position = 'absolute';
            container.style.pointerEvents = 'none';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.zIndex = '2147483647';
            document.body.appendChild(container);
          }

          const colors = [
            '#FF0000',
            '#00FF00',
            '#0000FF',
            '#FFA500',
            '#800080',
            '#008080',
            '#FF69B4',
            '#4B0082',
            '#FF4500',
            '#2E8B57',
            '#DC143C',
            '#4682B4',
          ];
          const colorIndex = index % colors.length;
          const baseColor = colors[colorIndex];
          // 10% opacity version of the color
          const backgroundColor = `${baseColor}1A`;

          // Create highlight overlay
          const overlay = document.createElement('div');
          overlay.style.position = 'absolute';
          overlay.style.border = `2px solid ${baseColor}`;
          overlay.style.backgroundColor = backgroundColor;
          overlay.style.pointerEvents = 'none';
          overlay.style.boxSizing = 'border-box';

          // Position overlay based on element, including scroll position
          const rect = element.getBoundingClientRect();
          let top = rect.top + window.scrollY;
          let left = rect.left + window.scrollX;

          // Adjust position if element is inside an iframe
          if (parentIframe) {
            const iframeRect = parentIframe.getBoundingClientRect();
            top += iframeRect.top;
            left += iframeRect.left;
          }

          overlay.style.top = `${top}px`;
          overlay.style.left = `${left}px`;
          overlay.style.width = `${rect.width}px`;
          overlay.style.height = `${rect.height}px`;

          // Create label
          const label = document.createElement('div');
          label.className = 'playwright-highlight-label';
          label.style.position = 'absolute';
          label.style.background = `${baseColor}`;
          label.style.color = 'white';
          label.style.padding = '1px 4px';
          label.style.borderRadius = '4px';
          label.style.fontSize = `${Math.min(12, Math.max(8, rect.height / 2))}px`; // Responsive font size
          label.textContent = `[${index}]`;

          // Calculate label position
          const labelWidth = 20; // Approximate width
          const labelHeight = 16; // Approximate height

          // Default position (top-right corner inside the box)
          let labelTop = top + 2;
          let labelLeft = left + rect.width - labelWidth - 2;

          // Adjust if box is too small
          if (rect.width < labelWidth + 4 || rect.height < labelHeight + 4) {
            // Position outside the box if it's too small
            labelTop = top - labelHeight - 2;
            labelLeft = left + rect.width - labelWidth;
          }

          label.style.top = `${labelTop}px`;
          label.style.left = `${labelLeft}px`;

          // Add to container
          container.appendChild(overlay);
          container.appendChild(label);

          // Store reference for cleanup
          element.setAttribute(
            'magic-inspector-highlight-id',
            `playwright-highlight-${index}`,
          );

          return index + 1;
        }

        function getXPathTree(element: ParentNode, stopAtBoundary = true) {
          const segments = [];
          let currentElement = element;

          while (
            currentElement &&
            currentElement.nodeType === Node.ELEMENT_NODE
          ) {
            // Stop if we hit a shadow root or iframe
            if (
              stopAtBoundary &&
              (currentElement.parentNode instanceof ShadowRoot ||
                currentElement.parentNode instanceof HTMLIFrameElement)
            ) {
              break;
            }

            let index = 0;
            let sibling = currentElement.previousSibling;
            while (sibling) {
              if (
                sibling.nodeType === Node.ELEMENT_NODE &&
                sibling.nodeName === currentElement.nodeName
              ) {
                index++;
              }
              sibling = sibling.previousSibling;
            }

            const tagName = currentElement.nodeName.toLowerCase();
            const xpathIndex = index > 0 ? `[${index + 1}]` : '';
            segments.unshift(`${tagName}${xpathIndex}`);

            // @ts-ignore // TODO: fix this type issue
            currentElement = currentElement.parentNode;
          }

          return segments.join('/');
        }

        function isElementAccepted(element: Element) {
          const leafElementDenyList = new Set([
            'svg',
            'script',
            'style',
            'link',
            'meta',
          ]);
          return !leafElementDenyList.has(element.tagName.toLowerCase());
        }

        function isInteractiveElement(element: HTMLElement) {
          const interactiveElements = new Set([
            'a',
            'button',
            'details',
            'embed',
            'input',
            'label',
            'menu',
            'menuitem',
            'object',
            'select',
            'textarea',
            'summary',
          ]);

          const interactiveRoles = new Set([
            'button',
            'menu',
            'menuitem',
            'link',
            'checkbox',
            'radio',
            'slider',
            'tab',
            'tabpanel',
            'textbox',
            'combobox',
            'grid',
            'listbox',
            'option',
            'progressbar',
            'scrollbar',
            'searchbox',
            'switch',
            'tree',
            'treeitem',
            'spinbutton',
            'tooltip',
            'a-button-inner',
            'a-dropdown-button',
            'click',
            'menuitemcheckbox',
            'menuitemradio',
            'a-button-text',
            'button-text',
            'button-icon',
            'button-icon-only',
            'button-text-icon-only',
            'dropdown',
            'combobox',
          ]);

          const tagName = element.tagName.toLowerCase();
          const role = element.getAttribute('role') ?? '';
          const ariaRole = element.getAttribute('aria-role') ?? '';
          const tabIndex = element.getAttribute('tabindex') ?? '';

          const hasAddressInputClass = element.classList.contains(
            'address-input__container__input',
          );

          // Basic role/attribute checks
          const hasInteractiveRole =
            hasAddressInputClass ||
            interactiveElements.has(tagName) ||
            interactiveRoles.has(role) ||
            interactiveRoles.has(ariaRole) ||
            (tabIndex !== null && tabIndex !== '-1') ||
            element.getAttribute('data-action') === 'a-dropdown-select' ||
            element.getAttribute('data-action') === 'a-dropdown-button';

          if (hasInteractiveRole) return true;

          const hasClickHandler =
            element.onclick !== null ||
            element.getAttribute('onclick') !== null ||
            element.hasAttribute('ng-click') ||
            element.hasAttribute('@click') ||
            element.hasAttribute('v-on:click');

          function getEventListeners(el: Element) {
            try {
              return window.getEventListeners?.(el) || {};
            } catch (e) {
              const listeners = {};

              const eventTypes = [
                'click',
                'mousedown',
                'mouseup',
                'touchstart',
                'touchend',
                'keydown',
                'keyup',
                'focus',
                'blur',
              ];

              for (const type of eventTypes) {
                // @ts-ignore // TODO: fix this
                const handler = el[`on${type}`];
                if (handler) {
                  // @ts-ignore // TODO: fix this
                  listeners[type] = [
                    {
                      listener: handler,
                      useCapture: false,
                    },
                  ];
                }
              }

              return listeners;
            }
          }

          // Check for click-related events on the element itself
          const listeners = getEventListeners(element);
          const hasClickListeners =
            listeners &&
            (listeners.click?.length > 0 ||
              listeners.mousedown?.length > 0 ||
              listeners.mouseup?.length > 0 ||
              listeners.touchstart?.length > 0 ||
              listeners.touchend?.length > 0);

          // Check for ARIA properties that suggest interactivity
          const hasAriaProps =
            element.hasAttribute('aria-expanded') ||
            element.hasAttribute('aria-pressed') ||
            element.hasAttribute('aria-selected') ||
            element.hasAttribute('aria-checked');

          // Check if element is draggable
          const isDraggable =
            element.draggable || element.getAttribute('draggable') === 'true';

          return (
            hasAriaProps || hasClickHandler || hasClickListeners || isDraggable
          );
        }

        function isElementVisible(element: HTMLElement) {
          const style = window.getComputedStyle(element);
          return (
            element.offsetWidth > 0 &&
            element.offsetHeight > 0 &&
            style.visibility !== 'hidden' &&
            style.display !== 'none'
          );
        }

        function isTopElement(element: Element) {
          // Find the correct document context and root element
          let doc = element.ownerDocument;

          // If we're in an iframe, elements are considered top by default
          if (doc !== window.document) {
            return true;
          }

          // For shadow DOM, we need to check within its own root context
          const shadowRoot = element.getRootNode();
          if (shadowRoot instanceof ShadowRoot) {
            const rect = element.getBoundingClientRect();
            const point = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            };

            try {
              // Use shadow root's elementFromPoint to check within shadow DOM context
              const topEl = shadowRoot.elementFromPoint(point.x, point.y);

              if (!topEl) return false;

              // Check if the element or any of its parents match our target element
              let current = topEl;
              // @ts-ignore // TODO: fix this
              while (current && current !== shadowRoot) {
                if (current === element) return true;
                current = current.parentElement as Element;
              }
              return false;
            } catch (e) {
              return true; // If we can't determine, consider it visible
            }
          }

          const rect = element.getBoundingClientRect();

          // If viewportExpansion is -1, check if element is the top one at its position
          if (viewportExpansion === -1) {
            return true; // Consider all elements as top elements when expansion is -1
          }

          // Calculate expanded viewport boundaries including scroll position
          const scrollX = window.scrollX;
          const scrollY = window.scrollY;
          const viewportTop = -viewportExpansion + scrollY;
          const viewportLeft = -viewportExpansion + scrollX;
          const viewportBottom =
            window.innerHeight + viewportExpansion + scrollY;
          const viewportRight = window.innerWidth + viewportExpansion + scrollX;

          // Get absolute element position
          const absTop = rect.top + scrollY;
          const absLeft = rect.left + scrollX;
          const absBottom = rect.bottom + scrollY;
          const absRight = rect.right + scrollX;

          // Skip if element is completely outside expanded viewport
          if (
            absBottom < viewportTop ||
            absTop > viewportBottom ||
            absRight < viewportLeft ||
            absLeft > viewportRight
          ) {
            return false;
          }

          // For elements within expanded viewport, check if they're the top element
          try {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Only clamp the point if it's outside the actual document
            const point = {
              x: centerX,
              y: centerY,
            };

            if (
              point.x < 0 ||
              point.x >= window.innerWidth ||
              point.y < 0 ||
              point.y >= window.innerHeight
            ) {
              return true; // Consider elements with center outside viewport as visible
            }

            const topEl = document.elementFromPoint(point.x, point.y);
            if (!topEl) return false;

            let current = topEl;
            while (current && current !== document.documentElement) {
              if (current === element) return true;
              // @ts-ignore // TODO: fix this
              current = current.parentElement;
            }
            return false;
          } catch (e) {
            return true;
          }
        }

        function isTextNodeVisible(textNode: Node) {
          const range = document.createRange();
          range.selectNodeContents(textNode);
          const rect = range.getBoundingClientRect();

          return (
            rect.width !== 0 &&
            rect.height !== 0 &&
            rect.top >= 0 &&
            rect.top <= window.innerHeight &&
            textNode.parentElement?.checkVisibility({
              checkOpacity: true,
              checkVisibilityCSS: true,
            })
          );
        }

        function getCoordinates(element: Element) {
          const rect = element.getBoundingClientRect();

          if (!rect) return null;

          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          if (isNaN(centerX) || isNaN(centerY)) return null;

          if (centerX <= 0 || centerY <= 0) return null;

          return {
            x: centerX,
            y: centerY,
          };
        }

        function buildDomTree(
          node: Element,
          parentIframe: HTMLIFrameElement | null = null,
        ): DomNode | null {
          if (!node) return null;

          // Special case for text nodes
          if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent?.trim() ?? '';

            if (textContent && isTextNodeVisible(node)) {
              return {
                type: 'TEXT_NODE',
                text: textContent,
                isVisible: true,
              };
            }
            return null;
          }

          if (node.nodeType === Node.ELEMENT_NODE && !isElementAccepted(node)) {
            return null;
          }

          const nodeData: Partial<ElementNode> = {
            tagName: node.tagName ? node.tagName.toLowerCase() : null,
            attributes: {},
            xpath:
              node.nodeType === Node.ELEMENT_NODE
                ? getXPathTree(node, true)
                : null,
            children: [],
          };

          if (node.nodeType === Node.ELEMENT_NODE && node.attributes) {
            const attributeNames = node.getAttributeNames?.() || [];
            if (!nodeData.attributes) {
              nodeData.attributes = {};
            }
            for (const name of attributeNames) {
              nodeData.attributes[name] = node.getAttribute(name) ?? '';
            }
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            const isInteractive = isInteractiveElement(node as HTMLElement);
            const isVisible = isElementVisible(node as HTMLElement);
            const coordinates = getCoordinates(node);
            const isTop = isTopElement(node);

            nodeData.isInteractive = isInteractive;
            nodeData.isVisible = isVisible;
            nodeData.isTopElement = isTop;
            nodeData.text = '';
            nodeData.coordinates = coordinates;

            if (isInteractive && isVisible && isTop) {
              nodeData.highlightIndex = highlightIndex++;
              if (doHighlightElements) {
                if (focusHighlightIndex >= 0) {
                  if (focusHighlightIndex === nodeData.highlightIndex) {
                    highlightElement(
                      node,
                      nodeData.highlightIndex,
                      parentIframe,
                    );
                  }
                } else {
                  highlightElement(node, nodeData.highlightIndex, parentIframe);
                }
              }
            }
          }

          // Only add shadowRoot field if it exists
          if (node.shadowRoot) {
            nodeData.shadowRoot = true;
          }

          // Handle shadow DOM
          if (node.shadowRoot) {
            const shadowChildren = Array.from(node.shadowRoot.childNodes).map(
              (child) => buildDomTree(child as Element, parentIframe),
            );
            nodeData.children?.push(...shadowChildren);
          }

          // Handle iframes
          if (node.tagName === 'IFRAME') {
            try {
              const iframeDoc =
                (node as HTMLIFrameElement).contentDocument ||
                (node as HTMLIFrameElement).contentWindow?.document;

              if (iframeDoc) {
                const iframeChildren = Array.from(
                  iframeDoc.body.childNodes,
                ).map((child) =>
                  buildDomTree(child as Element, node as HTMLIFrameElement),
                );
                nodeData.children?.push(...iframeChildren);
              }
            } catch (e) {
              console.warn('Unable to access iframe:', node);
            }
          } else {
            const children = Array.from(node.childNodes).map((child) =>
              buildDomTree(child as Element, parentIframe),
            );
            nodeData.children?.push(...children);
          }

          return nodeData as DomNode;
        }

        const domTree = buildDomTree(document.body);

        return domTree;
      }, withHighlight);

      return domState;
    } catch (error: unknown) {
      console.log('error', error);
      return null;
    }
  }
}
