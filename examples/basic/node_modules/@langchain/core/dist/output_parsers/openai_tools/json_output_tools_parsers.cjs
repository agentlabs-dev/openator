"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonOutputKeyToolsParser = exports.JsonOutputToolsParser = exports.makeInvalidToolCall = exports.convertLangChainToolCallToOpenAI = exports.parseToolCall = void 0;
const base_js_1 = require("../base.cjs");
const json_js_1 = require("../json.cjs");
const transform_js_1 = require("../transform.cjs");
const ai_js_1 = require("../../messages/ai.cjs");
function parseToolCall(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
rawToolCall, options) {
    if (rawToolCall.function === undefined) {
        return undefined;
    }
    let functionArgs;
    if (options?.partial) {
        try {
            functionArgs = (0, json_js_1.parsePartialJson)(rawToolCall.function.arguments ?? "{}");
        }
        catch (e) {
            return undefined;
        }
    }
    else {
        try {
            functionArgs = JSON.parse(rawToolCall.function.arguments);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (e) {
            throw new base_js_1.OutputParserException([
                `Function "${rawToolCall.function.name}" arguments:`,
                ``,
                rawToolCall.function.arguments,
                ``,
                `are not valid JSON.`,
                `Error: ${e.message}`,
            ].join("\n"));
        }
    }
    const parsedToolCall = {
        name: rawToolCall.function.name,
        args: functionArgs,
        type: "tool_call",
    };
    if (options?.returnId) {
        parsedToolCall.id = rawToolCall.id;
    }
    return parsedToolCall;
}
exports.parseToolCall = parseToolCall;
function convertLangChainToolCallToOpenAI(toolCall) {
    if (toolCall.id === undefined) {
        throw new Error(`All OpenAI tool calls must have an "id" field.`);
    }
    return {
        id: toolCall.id,
        type: "function",
        function: {
            name: toolCall.name,
            arguments: JSON.stringify(toolCall.args),
        },
    };
}
exports.convertLangChainToolCallToOpenAI = convertLangChainToolCallToOpenAI;
function makeInvalidToolCall(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
rawToolCall, errorMsg) {
    return {
        name: rawToolCall.function?.name,
        args: rawToolCall.function?.arguments,
        id: rawToolCall.id,
        error: errorMsg,
        type: "invalid_tool_call",
    };
}
exports.makeInvalidToolCall = makeInvalidToolCall;
/**
 * Class for parsing the output of a tool-calling LLM into a JSON object.
 */
class JsonOutputToolsParser extends transform_js_1.BaseCumulativeTransformOutputParser {
    static lc_name() {
        return "JsonOutputToolsParser";
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "returnId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "output_parsers", "openai_tools"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this.returnId = fields?.returnId ?? this.returnId;
    }
    _diff() {
        throw new Error("Not supported.");
    }
    async parse() {
        throw new Error("Not implemented.");
    }
    async parseResult(generations) {
        const result = await this.parsePartialResult(generations, false);
        return result;
    }
    /**
     * Parses the output and returns a JSON object. If `argsOnly` is true,
     * only the arguments of the function call are returned.
     * @param generations The output of the LLM to parse.
     * @returns A JSON object representation of the function call or its arguments.
     */
    async parsePartialResult(generations, partial = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) {
        const message = generations[0].message;
        let toolCalls;
        if ((0, ai_js_1.isAIMessage)(message) && message.tool_calls?.length) {
            toolCalls = message.tool_calls.map((toolCall) => {
                const { id, ...rest } = toolCall;
                if (!this.returnId) {
                    return rest;
                }
                return {
                    id,
                    ...rest,
                };
            });
        }
        else if (message.additional_kwargs.tool_calls !== undefined) {
            const rawToolCalls = JSON.parse(JSON.stringify(message.additional_kwargs.tool_calls));
            toolCalls = rawToolCalls.map((rawToolCall) => {
                return parseToolCall(rawToolCall, { returnId: this.returnId, partial });
            });
        }
        if (!toolCalls) {
            return [];
        }
        const parsedToolCalls = [];
        for (const toolCall of toolCalls) {
            if (toolCall !== undefined) {
                const backwardsCompatibleToolCall = {
                    type: toolCall.name,
                    args: toolCall.args,
                    id: toolCall.id,
                };
                parsedToolCalls.push(backwardsCompatibleToolCall);
            }
        }
        return parsedToolCalls;
    }
}
exports.JsonOutputToolsParser = JsonOutputToolsParser;
/**
 * Class for parsing the output of a tool-calling LLM into a JSON object if you are
 * expecting only a single tool to be called.
 */
class JsonOutputKeyToolsParser extends JsonOutputToolsParser {
    static lc_name() {
        return "JsonOutputKeyToolsParser";
    }
    constructor(params) {
        super(params);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "output_parsers", "openai_tools"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "returnId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        /** The type of tool calls to return. */
        Object.defineProperty(this, "keyName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Whether to return only the first tool call. */
        Object.defineProperty(this, "returnSingle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "zodSchema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.keyName = params.keyName;
        this.returnSingle = params.returnSingle ?? this.returnSingle;
        this.zodSchema = params.zodSchema;
    }
    async _validateResult(result) {
        if (this.zodSchema === undefined) {
            return result;
        }
        const zodParsedResult = await this.zodSchema.safeParseAsync(result);
        if (zodParsedResult.success) {
            return zodParsedResult.data;
        }
        else {
            throw new base_js_1.OutputParserException(`Failed to parse. Text: "${JSON.stringify(result, null, 2)}". Error: ${JSON.stringify(zodParsedResult.error.errors)}`, JSON.stringify(result, null, 2));
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async parsePartialResult(generations) {
        const results = await super.parsePartialResult(generations);
        const matchingResults = results.filter((result) => result.type === this.keyName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let returnedValues = matchingResults;
        if (!matchingResults.length) {
            return undefined;
        }
        if (!this.returnId) {
            returnedValues = matchingResults.map((result) => result.args);
        }
        if (this.returnSingle) {
            return returnedValues[0];
        }
        return returnedValues;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async parseResult(generations) {
        const results = await super.parsePartialResult(generations, false);
        const matchingResults = results.filter((result) => result.type === this.keyName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let returnedValues = matchingResults;
        if (!matchingResults.length) {
            return undefined;
        }
        if (!this.returnId) {
            returnedValues = matchingResults.map((result) => result.args);
        }
        if (this.returnSingle) {
            return this._validateResult(returnedValues[0]);
        }
        const toolCallResults = await Promise.all(returnedValues.map((value) => this._validateResult(value)));
        return toolCallResults;
    }
}
exports.JsonOutputKeyToolsParser = JsonOutputKeyToolsParser;
