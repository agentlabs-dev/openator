"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCumulativeTransformOutputParser = exports.BaseTransformOutputParser = void 0;
const json_schema_1 = require("@cfworker/json-schema");
const base_js_1 = require("./base.cjs");
const base_js_2 = require("../messages/base.cjs");
const utils_js_1 = require("../messages/utils.cjs");
const outputs_js_1 = require("../outputs.cjs");
/**
 * Class to parse the output of an LLM call that also allows streaming inputs.
 */
class BaseTransformOutputParser extends base_js_1.BaseOutputParser {
    async *_transform(inputGenerator) {
        for await (const chunk of inputGenerator) {
            if (typeof chunk === "string") {
                yield this.parseResult([{ text: chunk }]);
            }
            else {
                yield this.parseResult([
                    {
                        message: chunk,
                        text: this._baseMessageToString(chunk),
                    },
                ]);
            }
        }
    }
    /**
     * Transforms an asynchronous generator of input into an asynchronous
     * generator of parsed output.
     * @param inputGenerator An asynchronous generator of input.
     * @param options A configuration object.
     * @returns An asynchronous generator of parsed output.
     */
    async *transform(inputGenerator, options) {
        yield* this._transformStreamWithConfig(inputGenerator, this._transform.bind(this), {
            ...options,
            runType: "parser",
        });
    }
}
exports.BaseTransformOutputParser = BaseTransformOutputParser;
/**
 * A base class for output parsers that can handle streaming input. It
 * extends the `BaseTransformOutputParser` class and provides a method for
 * converting parsed outputs into a diff format.
 */
class BaseCumulativeTransformOutputParser extends BaseTransformOutputParser {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "diff", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.diff = fields?.diff ?? this.diff;
    }
    async *_transform(inputGenerator) {
        let prevParsed;
        let accGen;
        for await (const chunk of inputGenerator) {
            if (typeof chunk !== "string" && typeof chunk.content !== "string") {
                throw new Error("Cannot handle non-string output.");
            }
            let chunkGen;
            if ((0, base_js_2.isBaseMessageChunk)(chunk)) {
                if (typeof chunk.content !== "string") {
                    throw new Error("Cannot handle non-string message output.");
                }
                chunkGen = new outputs_js_1.ChatGenerationChunk({
                    message: chunk,
                    text: chunk.content,
                });
            }
            else if ((0, base_js_2.isBaseMessage)(chunk)) {
                if (typeof chunk.content !== "string") {
                    throw new Error("Cannot handle non-string message output.");
                }
                chunkGen = new outputs_js_1.ChatGenerationChunk({
                    message: (0, utils_js_1.convertToChunk)(chunk),
                    text: chunk.content,
                });
            }
            else {
                chunkGen = new outputs_js_1.GenerationChunk({ text: chunk });
            }
            if (accGen === undefined) {
                accGen = chunkGen;
            }
            else {
                accGen = accGen.concat(chunkGen);
            }
            const parsed = await this.parsePartialResult([accGen]);
            if (parsed !== undefined &&
                parsed !== null &&
                !(0, json_schema_1.deepCompareStrict)(parsed, prevParsed)) {
                if (this.diff) {
                    yield this._diff(prevParsed, parsed);
                }
                else {
                    yield parsed;
                }
                prevParsed = parsed;
            }
        }
    }
    getFormatInstructions() {
        return "";
    }
}
exports.BaseCumulativeTransformOutputParser = BaseCumulativeTransformOutputParser;
