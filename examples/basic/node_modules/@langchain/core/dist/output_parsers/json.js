import { BaseCumulativeTransformOutputParser } from "./transform.js";
import { compare } from "../utils/json_patch.js";
import { parseJsonMarkdown, parsePartialJson } from "../utils/json.js";
/**
 * Class for parsing the output of an LLM into a JSON object.
 */
export class JsonOutputParser extends BaseCumulativeTransformOutputParser {
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
        return compare(prev, next);
    }
    // This should actually return Partial<T>, but there's no way
    // to specify emitted chunks as instances separate from the main output type.
    async parsePartialResult(generations) {
        return parseJsonMarkdown(generations[0].text);
    }
    async parse(text) {
        return parseJsonMarkdown(text, JSON.parse);
    }
    getFormatInstructions() {
        return "";
    }
}
export { parsePartialJson, parseJsonMarkdown };
