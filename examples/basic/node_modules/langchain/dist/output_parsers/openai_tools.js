import { BaseLLMOutputParser } from "@langchain/core/output_parsers";
/**
 * @deprecated Import from "@langchain/core/output_parsers/openai_tools"
 */
export class JsonOutputToolsParser extends BaseLLMOutputParser {
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
    /**
     * Parses the output and returns a JSON object. If `argsOnly` is true,
     * only the arguments of the function call are returned.
     * @param generations The output of the LLM to parse.
     * @returns A JSON object representation of the function call or its arguments.
     */
    async parseResult(generations) {
        const toolCalls = generations[0].message.additional_kwargs.tool_calls;
        if (!toolCalls) {
            throw new Error(`No tools_call in message ${JSON.stringify(generations)}`);
        }
        const clonedToolCalls = JSON.parse(JSON.stringify(toolCalls));
        const parsedToolCalls = [];
        for (const toolCall of clonedToolCalls) {
            if (toolCall.function !== undefined) {
                // @ts-expect-error name and arguemnts are defined by Object.defineProperty
                const parsedToolCall = {
                    type: toolCall.function.name,
                    args: JSON.parse(toolCall.function.arguments),
                };
                if (this.returnId) {
                    parsedToolCall.id = toolCall.id;
                }
                // backward-compatibility with previous
                // versions of Langchain JS, which uses `name` and `arguments`
                Object.defineProperty(parsedToolCall, "name", {
                    get() {
                        return this.type;
                    },
                });
                Object.defineProperty(parsedToolCall, "arguments", {
                    get() {
                        return this.args;
                    },
                });
                parsedToolCalls.push(parsedToolCall);
            }
        }
        return parsedToolCalls;
    }
}
/**
 * @deprecated Import from "@langchain/core/output_parsers/openai_tools"
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class JsonOutputKeyToolsParser extends BaseLLMOutputParser {
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
        Object.defineProperty(this, "initialParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.keyName = params.keyName;
        this.returnSingle = params.returnSingle ?? this.returnSingle;
        this.initialParser = new JsonOutputToolsParser(params);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async parseResult(generations) {
        const results = await this.initialParser.parseResult(generations);
        const matchingResults = results.filter((result) => result.type === this.keyName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let returnedValues = matchingResults;
        if (!this.returnId) {
            returnedValues = matchingResults.map((result) => result.args);
        }
        if (this.returnSingle) {
            return returnedValues[0];
        }
        return returnedValues;
    }
}
