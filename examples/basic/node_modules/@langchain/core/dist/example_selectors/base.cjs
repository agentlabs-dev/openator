"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseExampleSelector = void 0;
const serializable_js_1 = require("../load/serializable.cjs");
/**
 * Base class for example selectors.
 */
class BaseExampleSelector extends serializable_js_1.Serializable {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "example_selectors", "base"]
        });
    }
}
exports.BaseExampleSelector = BaseExampleSelector;
