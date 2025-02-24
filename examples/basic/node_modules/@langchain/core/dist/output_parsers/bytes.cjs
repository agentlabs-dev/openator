"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BytesOutputParser = void 0;
const transform_js_1 = require("./transform.cjs");
/**
 * OutputParser that parses LLMResult into the top likely string and
 * encodes it into bytes.
 */
class BytesOutputParser extends transform_js_1.BaseTransformOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "output_parsers", "bytes"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        // TODO: Figure out why explicit typing is needed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.defineProperty(this, "textEncoder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new TextEncoder()
        });
    }
    static lc_name() {
        return "BytesOutputParser";
    }
    parse(text) {
        return Promise.resolve(this.textEncoder.encode(text));
    }
    getFormatInstructions() {
        return "";
    }
}
exports.BytesOutputParser = BytesOutputParser;
