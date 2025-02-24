"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringOutputParser = void 0;
const transform_js_1 = require("./transform.cjs");
/**
 * OutputParser that parses LLMResult into the top likely string.
 * @example
 * ```typescript
 * const promptTemplate = PromptTemplate.fromTemplate(
 *   "Tell me a joke about {topic}",
 * );
 *
 * const chain = RunnableSequence.from([
 *   promptTemplate,
 *   new ChatOpenAI({}),
 *   new StringOutputParser(),
 * ]);
 *
 * const result = await chain.invoke({ topic: "bears" });
 * console.log("What do you call a bear with no teeth? A gummy bear!");
 * ```
 */
class StringOutputParser extends transform_js_1.BaseTransformOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "output_parsers", "string"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
    static lc_name() {
        return "StrOutputParser";
    }
    /**
     * Parses a string output from an LLM call. This method is meant to be
     * implemented by subclasses to define how a string output from an LLM
     * should be parsed.
     * @param text The string output from an LLM call.
     * @param callbacks Optional callbacks.
     * @returns A promise of the parsed output.
     */
    parse(text) {
        return Promise.resolve(text);
    }
    getFormatInstructions() {
        return "";
    }
    _textContentToString(content) {
        return content.text;
    }
    _imageUrlContentToString(_content) {
        throw new Error(`Cannot coerce a multimodal "image_url" message part into a string.`);
    }
    _messageContentComplexToString(content) {
        switch (content.type) {
            case "text":
            case "text_delta":
                if ("text" in content) {
                    // Type guard for MessageContentText
                    return this._textContentToString(content);
                }
                break;
            case "image_url":
                if ("image_url" in content) {
                    // Type guard for MessageContentImageUrl
                    return this._imageUrlContentToString(content);
                }
                break;
            default:
                throw new Error(`Cannot coerce "${content.type}" message part into a string.`);
        }
        throw new Error(`Invalid content type: ${content.type}`);
    }
    _baseMessageContentToString(content) {
        return content.reduce((acc, item) => acc + this._messageContentComplexToString(item), "");
    }
}
exports.StringOutputParser = StringOutputParser;
