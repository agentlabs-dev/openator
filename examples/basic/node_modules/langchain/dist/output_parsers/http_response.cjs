"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpResponseOutputParser = void 0;
const output_parsers_1 = require("@langchain/core/output_parsers");
/**
 * OutputParser that formats chunks emitted from an LLM for different HTTP content types.
 */
class HttpResponseOutputParser extends output_parsers_1.BaseTransformOutputParser {
    static lc_name() {
        return "HttpResponseOutputParser";
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "output_parser"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new output_parsers_1.StringOutputParser()
        });
        Object.defineProperty(this, "contentType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "text/plain"
        });
        this.outputParser = fields?.outputParser ?? this.outputParser;
        this.contentType = fields?.contentType ?? this.contentType;
    }
    async *_transform(inputGenerator) {
        for await (const chunk of this.outputParser._transform(inputGenerator)) {
            if (typeof chunk === "string") {
                yield this.parse(chunk);
            }
            else {
                yield this.parse(JSON.stringify(chunk));
            }
        }
        if (this.contentType === "text/event-stream") {
            const encoder = new TextEncoder();
            yield encoder.encode(`event: end\n\n`);
        }
    }
    /**
     * Parses a string output from an LLM call. This method is meant to be
     * implemented by subclasses to define how a string output from an LLM
     * should be parsed.
     * @param text The string output from an LLM call.
     * @param callbacks Optional callbacks.
     * @returns A promise of the parsed output.
     */
    async parse(text) {
        const chunk = await this.outputParser.parse(text);
        const encoder = new TextEncoder();
        if (this.contentType === "text/event-stream") {
            return encoder.encode(`event: data\ndata: ${JSON.stringify(chunk)}\n\n`);
        }
        let parsedChunk;
        if (typeof chunk === "string") {
            parsedChunk = chunk;
        }
        else {
            parsedChunk = JSON.stringify(chunk);
        }
        return encoder.encode(parsedChunk);
    }
    getFormatInstructions() {
        return "";
    }
}
exports.HttpResponseOutputParser = HttpResponseOutputParser;
