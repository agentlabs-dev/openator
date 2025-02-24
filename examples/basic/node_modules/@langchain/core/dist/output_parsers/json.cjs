"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonMarkdown = exports.parsePartialJson = exports.JsonOutputParser = void 0;
const transform_js_1 = require("./transform.cjs");
const json_patch_js_1 = require("../utils/json_patch.cjs");
const json_js_1 = require("../utils/json.cjs");
Object.defineProperty(exports, "parseJsonMarkdown", { enumerable: true, get: function () { return json_js_1.parseJsonMarkdown; } });
Object.defineProperty(exports, "parsePartialJson", { enumerable: true, get: function () { return json_js_1.parsePartialJson; } });
/**
 * Class for parsing the output of an LLM into a JSON object.
 */
class JsonOutputParser extends transform_js_1.BaseCumulativeTransformOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "output_parsers"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
    static lc_name() {
        return "JsonOutputParser";
    }
    _diff(prev, next) {
        if (!next) {
            return undefined;
        }
        if (!prev) {
            return [{ op: "replace", path: "", value: next }];
        }
        return (0, json_patch_js_1.compare)(prev, next);
    }
    // This should actually return Partial<T>, but there's no way
    // to specify emitted chunks as instances separate from the main output type.
    async parsePartialResult(generations) {
        return (0, json_js_1.parseJsonMarkdown)(generations[0].text);
    }
    async parse(text) {
        return (0, json_js_1.parseJsonMarkdown)(text, JSON.parse);
    }
    getFormatInstructions() {
        return "";
    }
}
exports.JsonOutputParser = JsonOutputParser;
