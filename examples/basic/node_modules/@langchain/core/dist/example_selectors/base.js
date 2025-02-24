import { Serializable } from "../load/serializable.js";
/**
 * Base class for example selectors.
 */
export class BaseExampleSelector extends Serializable {
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
