import * as crypto from 'crypto';
const isElementNode = (node) => {
    if (!node)
        return false;
    return !('type' in node) || node.type !== 'TEXT_NODE';
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
export const isTextNode = (node) => {
    return 'type' in node && node.type === 'TEXT_NODE';
};
export class DomService {
    constructor(screenshotService, browserService, eventBus) {
        this.screenshotService = screenshotService;
        this.browserService = browserService;
        this.eventBus = eventBus;
        this.domContext = {
            selectorMap: {},
        };
    }
    stringifyDomStateForHash(nodeState) {
        const items = [];
        const format = (node) => {
            if (!isElementNode(node)) {
                return;
            }
            if (node.highlightIndex) {
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
    hashDomState(domState) {
        if (!domState) {
            return '';
        }
        const domStateString = this.stringifyDomStateForHash(domState);
        return crypto.createHash('sha256').update(domStateString).digest('hex');
    }
    getIndexSelector(index) {
        const domNode = this.domContext?.selectorMap[index];
        if (!domNode) {
            return null;
        }
        if (isTextNode(domNode)) {
            return null;
        }
        return domNode.coordinates;
    }
    async getDomState(withHighlight = true) {
        await this.resetHighlightElements();
        const pristineScreenshot = await this.screenshotService.takeScreenshot(await this.browserService.getStablePage());
        this.eventBus.emit('pristine-screenshot:taken', pristineScreenshot);
        const state = await this.highlightForSoM(withHighlight);
        const screenshot = await this.screenshotService.takeScreenshot(await this.browserService.getStablePage());
        const pixelAbove = await this.browserService.getPixelAbove();
        const pixelBelow = await this.browserService.getPixelBelow();
        return {
            screenshot,
            pristineScreenshot,
            domState: state,
            pixelAbove,
            pixelBelow,
        };
    }
    async getInteractiveElements(withHighlight = true) {
        const { screenshot, pristineScreenshot, domState, pixelAbove, pixelBelow } = await this.getDomState(withHighlight);
        const selectorMap = this.createSelectorMap(domState);
        const stringifiedDomState = this.stringifyDomState(domState);
        const domStateHash = this.hashDomState(domState);
        this.domContext.selectorMap = selectorMap;
        return {
            screenshot,
            pristineScreenshot,
            domState,
            selectorMap,
            stringifiedDomState,
            domStateHash,
            pixelAbove,
            pixelBelow,
        };
    }
    createSelectorMap(nodeState) {
        const selectorMap = {};
        const mapNode = (node) => {
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
    stringifyDomState(nodeState) {
        const items = [];
        const format = (node) => {
            if (!isElementNode(node)) {
                return;
            }
            const attributes = Object.entries(node.attributes)
                .filter(([key]) => IMPORTANT_ATTRIBUTES.includes(key))
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ');
            if (node.highlightIndex) {
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
                const container = document.getElementById('playwright-highlight-container');
                if (container) {
                    container.remove();
                }
                const highlightedElements = document.querySelectorAll('[magic-inspector-highlight-id^="playwright-highlight-"]');
                highlightedElements.forEach((el) => {
                    el.removeAttribute('magic-inspector-highlight-id');
                });
            }
            catch (e) {
                console.error('Failed to remove highlights:', e);
            }
        });
    }
    async highlightElementWheel(direction) {
        const page = await this.browserService.getStablePage();
        await page.evaluate((direction) => {
            console.log('highlightElementWheel', direction);
        }, direction);
    }
    async highlightElementPointer(coordinates) {
        const page = await this.browserService.getStablePage();
        await page.evaluate((coordinates) => {
            try {
                let container = document.getElementById('playwright-pointer-highlight-container');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'playwright-pointer-highlight-container';
                    container.style.position = 'fixed';
                    container.style.pointerEvents = 'none';
                    container.style.top = '0';
                    container.style.left = '0';
                    container.style.width = '100%';
                    container.style.height = '100%';
                    container.style.zIndex = '2147483647';
                    document.body.appendChild(container);
                }
                const circle = document.createElement('div');
                circle.style.position = 'absolute';
                circle.style.width = '20px';
                circle.style.height = '20px';
                circle.style.borderRadius = '50%';
                circle.style.backgroundColor = 'red';
                circle.style.left = `${coordinates.x - 10}px`;
                circle.style.top = `${coordinates.y - 10}px`;
                circle.style.pointerEvents = 'none';
                container.appendChild(circle);
                setTimeout(() => {
                    circle.remove();
                    container.remove();
                }, 2000);
            }
            catch (e) {
                console.error('Failed to draw highlight circle:', e);
            }
        }, coordinates);
    }
    async waitForStability(page) {
        await page.waitForTimeout(1500);
    }
    async highlightForSoM(withHighlight = true) {
        try {
            const page = await this.browserService.getStablePage();
            if (page.isClosed()) {
                return null;
            }
            await this.waitForStability(page);
            const domState = await page.evaluate((withHighlight) => {
                const doHighlightElements = true;
                const focusHighlightIndex = -1;
                const viewportExpansion = 0;
                let highlightIndex = 0;
                function highlightElement(element, index, parentIframe = null) {
                    if (!withHighlight) {
                        return;
                    }
                    let container = document.getElementById('playwright-highlight-container');
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
                    const backgroundColor = `${baseColor}1A`;
                    const overlay = document.createElement('div');
                    overlay.style.position = 'absolute';
                    overlay.style.border = `2px solid ${baseColor}`;
                    overlay.style.backgroundColor = backgroundColor;
                    overlay.style.pointerEvents = 'none';
                    overlay.style.boxSizing = 'border-box';
                    const rect = element.getBoundingClientRect();
                    let top = rect.top + window.scrollY;
                    let left = rect.left + window.scrollX;
                    if (parentIframe) {
                        const iframeRect = parentIframe.getBoundingClientRect();
                        top += iframeRect.top;
                        left += iframeRect.left;
                    }
                    overlay.style.top = `${top}px`;
                    overlay.style.left = `${left}px`;
                    overlay.style.width = `${rect.width}px`;
                    overlay.style.height = `${rect.height}px`;
                    const label = document.createElement('div');
                    label.className = 'playwright-highlight-label';
                    label.style.position = 'absolute';
                    label.style.background = `${baseColor}`;
                    label.style.color = 'white';
                    label.style.padding = '1px 4px';
                    label.style.borderRadius = '4px';
                    label.style.fontSize = `${Math.min(12, Math.max(8, rect.height / 2))}px`;
                    label.textContent = `[${index}]`;
                    const labelWidth = 20;
                    const labelHeight = 16;
                    let labelTop = top + 2;
                    let labelLeft = left + rect.width - labelWidth - 2;
                    if (rect.width < labelWidth + 4 || rect.height < labelHeight + 4) {
                        labelTop = top - labelHeight - 2;
                        labelLeft = left + rect.width - labelWidth;
                    }
                    label.style.top = `${labelTop}px`;
                    label.style.left = `${labelLeft}px`;
                    container.appendChild(overlay);
                    container.appendChild(label);
                    element.setAttribute('magic-inspector-highlight-id', `playwright-highlight-${index}`);
                    return index + 1;
                }
                function getXPathTree(element, stopAtBoundary = true) {
                    const segments = [];
                    let currentElement = element;
                    while (currentElement &&
                        currentElement.nodeType === Node.ELEMENT_NODE) {
                        if (stopAtBoundary &&
                            (currentElement.parentNode instanceof ShadowRoot ||
                                currentElement.parentNode instanceof HTMLIFrameElement)) {
                            break;
                        }
                        let index = 0;
                        let sibling = currentElement.previousSibling;
                        while (sibling) {
                            if (sibling.nodeType === Node.ELEMENT_NODE &&
                                sibling.nodeName === currentElement.nodeName) {
                                index++;
                            }
                            sibling = sibling.previousSibling;
                        }
                        const tagName = currentElement.nodeName.toLowerCase();
                        const xpathIndex = index > 0 ? `[${index + 1}]` : '';
                        segments.unshift(`${tagName}${xpathIndex}`);
                        currentElement = currentElement.parentNode;
                    }
                    return segments.join('/');
                }
                function isElementAccepted(element) {
                    const leafElementDenyList = new Set([
                        'svg',
                        'script',
                        'style',
                        'link',
                        'meta',
                    ]);
                    return !leafElementDenyList.has(element.tagName.toLowerCase());
                }
                function isInteractiveElement(element) {
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
                    const hasAddressInputClass = element.classList.contains('address-input__container__input');
                    const hasInteractiveRole = hasAddressInputClass ||
                        interactiveElements.has(tagName) ||
                        interactiveRoles.has(role) ||
                        interactiveRoles.has(ariaRole) ||
                        (tabIndex !== null && tabIndex !== '-1') ||
                        element.getAttribute('data-action') === 'a-dropdown-select' ||
                        element.getAttribute('data-action') === 'a-dropdown-button';
                    if (hasInteractiveRole)
                        return true;
                    const hasClickHandler = element.onclick !== null ||
                        element.getAttribute('onclick') !== null ||
                        element.hasAttribute('ng-click') ||
                        element.hasAttribute('@click') ||
                        element.hasAttribute('v-on:click');
                    function getEventListeners(el) {
                        try {
                            return window.getEventListeners?.(el) || {};
                        }
                        catch (e) {
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
                                const handler = el[`on${type}`];
                                if (handler) {
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
                    const listeners = getEventListeners(element);
                    const hasClickListeners = listeners &&
                        (listeners.click?.length > 0 ||
                            listeners.mousedown?.length > 0 ||
                            listeners.mouseup?.length > 0 ||
                            listeners.touchstart?.length > 0 ||
                            listeners.touchend?.length > 0);
                    const hasAriaProps = element.hasAttribute('aria-expanded') ||
                        element.hasAttribute('aria-pressed') ||
                        element.hasAttribute('aria-selected') ||
                        element.hasAttribute('aria-checked');
                    const isDraggable = element.draggable || element.getAttribute('draggable') === 'true';
                    return (hasAriaProps || hasClickHandler || hasClickListeners || isDraggable);
                }
                function isElementVisible(element) {
                    const style = window.getComputedStyle(element);
                    return (element.offsetWidth > 0 &&
                        element.offsetHeight > 0 &&
                        style.visibility !== 'hidden' &&
                        style.display !== 'none');
                }
                function isTopElement(element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.bottom < 0 || rect.top > window.innerHeight)
                        return false;
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const topEl = document.elementFromPoint(centerX, centerY);
                    return topEl === element || element.contains(topEl);
                }
                function isTopElementOld(element) {
                    let doc = element.ownerDocument;
                    if (doc !== window.document) {
                        return true;
                    }
                    const shadowRoot = element.getRootNode();
                    if (shadowRoot instanceof ShadowRoot) {
                        const rect = element.getBoundingClientRect();
                        const point = {
                            x: rect.left + rect.width / 2,
                            y: rect.top + rect.height / 2,
                        };
                        try {
                            const topEl = shadowRoot.elementFromPoint(point.x, point.y);
                            if (!topEl)
                                return false;
                            let current = topEl;
                            while (current && current !== shadowRoot) {
                                if (current === element)
                                    return true;
                                current = current.parentElement;
                            }
                            return false;
                        }
                        catch (e) {
                            return true;
                        }
                    }
                    const rect = element.getBoundingClientRect();
                    if (viewportExpansion === -1) {
                        return true;
                    }
                    const scrollX = window.scrollX;
                    const scrollY = window.scrollY;
                    const viewportTop = -viewportExpansion + scrollY;
                    const viewportLeft = -viewportExpansion + scrollX;
                    const viewportBottom = window.innerHeight + viewportExpansion + scrollY;
                    const viewportRight = window.innerWidth + viewportExpansion + scrollX;
                    const absTop = rect.top + scrollY;
                    const absLeft = rect.left + scrollX;
                    const absBottom = rect.bottom + scrollY;
                    const absRight = rect.right + scrollX;
                    if (absBottom < viewportTop ||
                        absTop > viewportBottom ||
                        absRight < viewportLeft ||
                        absLeft > viewportRight) {
                        return false;
                    }
                    try {
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;
                        const point = {
                            x: centerX,
                            y: centerY,
                        };
                        if (point.x < 0 ||
                            point.x >= window.innerWidth ||
                            point.y < 0 ||
                            point.y >= window.innerHeight) {
                            return true;
                        }
                        const topEl = document.elementFromPoint(point.x, point.y);
                        if (!topEl)
                            return false;
                        let current = topEl;
                        while (current && current !== document.documentElement) {
                            if (current === element)
                                return true;
                            current = current.parentElement;
                        }
                        return false;
                    }
                    catch (e) {
                        return true;
                    }
                }
                function isTextNodeVisible(textNode) {
                    const range = document.createRange();
                    range.selectNodeContents(textNode);
                    const rect = range.getBoundingClientRect();
                    return (rect.width !== 0 &&
                        rect.height !== 0 &&
                        rect.top >= 0 &&
                        rect.top <= window.innerHeight &&
                        textNode.parentElement?.checkVisibility({
                            checkOpacity: true,
                            checkVisibilityCSS: true,
                        }));
                }
                function getCoordinates(element) {
                    const rect = element.getBoundingClientRect();
                    if (!rect)
                        return null;
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    if (isNaN(centerX) || isNaN(centerY))
                        return null;
                    if (centerX <= 0 || centerY <= 0)
                        return null;
                    return {
                        x: centerX,
                        y: centerY,
                    };
                }
                function buildDomTree(node, parentIframe = null) {
                    if (!node)
                        return null;
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
                    const nodeData = {
                        tagName: node.tagName ? node.tagName.toLowerCase() : null,
                        attributes: {},
                        xpath: node.nodeType === Node.ELEMENT_NODE
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
                        const isInteractive = isInteractiveElement(node);
                        const isVisible = isElementVisible(node);
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
                                        highlightElement(node, nodeData.highlightIndex, parentIframe);
                                    }
                                }
                                else {
                                    highlightElement(node, nodeData.highlightIndex, parentIframe);
                                }
                            }
                        }
                    }
                    if (node.shadowRoot) {
                        nodeData.shadowRoot = true;
                    }
                    if (node.shadowRoot) {
                        const shadowChildren = Array.from(node.shadowRoot.childNodes).map((child) => buildDomTree(child, parentIframe));
                        nodeData.children?.push(...shadowChildren);
                    }
                    if (node.tagName === 'IFRAME') {
                        try {
                            const iframeDoc = node.contentDocument ||
                                node.contentWindow?.document;
                            if (iframeDoc) {
                                const iframeChildren = Array.from(iframeDoc.body.childNodes).map((child) => buildDomTree(child, node));
                                nodeData.children?.push(...iframeChildren);
                            }
                        }
                        catch (e) {
                            console.warn('Unable to access iframe:', node);
                        }
                    }
                    else {
                        const children = Array.from(node.childNodes).map((child) => buildDomTree(child, parentIframe));
                        nodeData.children?.push(...children);
                    }
                    return nodeData;
                }
                const domTree = buildDomTree(document.body);
                return domTree;
            }, withHighlight);
            return domState;
        }
        catch (error) {
            console.log('error', error);
            return null;
        }
    }
}
//# sourceMappingURL=dom-service.js.map