"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeInfo = void 0;
/**
 * A simple data structure that holds information about an attribute. It
 * is typically used to provide metadata about attributes in other classes
 * or data structures within the LangChain framework.
 * @deprecated
 */
class AttributeInfo {
    constructor(name, type, description) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: name
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: type
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
    }
}
exports.AttributeInfo = AttributeInfo;
