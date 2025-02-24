"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredChatOutputParserWithRetries = exports.StructuredChatOutputParser = void 0;
const output_parsers_1 = require("@langchain/core/output_parsers");
const prompts_1 = require("@langchain/core/prompts");
const types_js_1 = require("../types.cjs");
const prompt_js_1 = require("./prompt.cjs");
const fix_js_1 = require("../../output_parsers/fix.cjs");
/**
 * A class that provides a custom implementation for parsing the output of
 * a StructuredChatAgent action. It extends the `AgentActionOutputParser`
 * class and extracts the action and action input from the text output,
 * returning an `AgentAction` or `AgentFinish` object.
 */
class StructuredChatOutputParser extends types_js_1.AgentActionOutputParser {
    constructor(fields) {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "structured_chat"]
        });
        Object.defineProperty(this, "toolNames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.toolNames = fields.toolNames;
    }
    /**
     * Parses the given text and returns an `AgentAction` or `AgentFinish`
     * object. If an `OutputFixingParser` is provided, it is used for parsing;
     * otherwise, the base parser is used.
     * @param text The text to parse.
     * @param callbacks Optional callbacks for asynchronous operations.
     * @returns A Promise that resolves to an `AgentAction` or `AgentFinish` object.
     */
    async parse(text) {
        try {
            const regex = /```(?:json)?(.*)(```)/gs;
            const actionMatch = regex.exec(text);
            if (actionMatch === null) {
                throw new output_parsers_1.OutputParserException(`Could not parse an action. The agent action must be within a markdown code block, and "action" must be a provided tool or "Final Answer"`);
            }
            const response = JSON.parse(actionMatch[1].trim());
            const { action, action_input } = response;
            if (action === "Final Answer") {
                return { returnValues: { output: action_input }, log: text };
            }
            return { tool: action, toolInput: action_input || {}, log: text };
        }
        catch (e) {
            throw new output_parsers_1.OutputParserException(`Failed to parse. Text: "${text}". Error: ${e}`);
        }
    }
    /**
     * Returns the format instructions for parsing the output of an agent
     * action in the style of the StructuredChatAgent.
     * @returns A string representing the format instructions.
     */
    getFormatInstructions() {
        return (0, prompts_1.renderTemplate)(prompt_js_1.AGENT_ACTION_FORMAT_INSTRUCTIONS, "f-string", {
            tool_names: this.toolNames.join(", "),
        });
    }
}
exports.StructuredChatOutputParser = StructuredChatOutputParser;
/**
 * A class that provides a wrapper around the `StructuredChatOutputParser`
 * and `OutputFixingParser` classes. It extends the
 * `AgentActionOutputParser` class and allows for retrying the output
 * parsing using the `OutputFixingParser` if it is provided.
 * @example
 * ```typescript
 * const outputParser = new StructuredChatOutputParserWithRetries.fromLLM(
 *   new ChatOpenAI({ temperature: 0 }),
 *   {
 *     toolNames: ["calculator", "random-number-generator"],
 *   },
 * );
 * const result = await outputParser.parse(
 *  "What is a random number between 5 and 10 raised to the second power?"
 * );
 * ```
 */
class StructuredChatOutputParserWithRetries extends types_js_1.AgentActionOutputParser {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "structured_chat"]
        });
        Object.defineProperty(this, "baseParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputFixingParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "toolNames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.toolNames = fields.toolNames ?? this.toolNames;
        this.baseParser =
            fields?.baseParser ??
                new StructuredChatOutputParser({ toolNames: this.toolNames });
        this.outputFixingParser = fields?.outputFixingParser;
    }
    /**
     * Parses the given text and returns an `AgentAction` or `AgentFinish`
     * object. Throws an `OutputParserException` if the parsing fails.
     * @param text The text to parse.
     * @returns A Promise that resolves to an `AgentAction` or `AgentFinish` object.
     */
    async parse(text, callbacks) {
        if (this.outputFixingParser !== undefined) {
            return this.outputFixingParser.parse(text, callbacks);
        }
        return this.baseParser.parse(text);
    }
    /**
     * Returns the format instructions for parsing the output of an agent
     * action in the style of the StructuredChatAgent.
     * @returns A string representing the format instructions.
     */
    getFormatInstructions() {
        return (0, prompts_1.renderTemplate)(prompt_js_1.FORMAT_INSTRUCTIONS, "f-string", {
            tool_names: this.toolNames.join(", "),
        });
    }
    /**
     * Creates a new `StructuredChatOutputParserWithRetries` instance from a
     * `BaseLanguageModel` and options. The options can include a base parser
     * and tool names.
     * @param llm A `BaseLanguageModel` instance.
     * @param options Options for creating a `StructuredChatOutputParserWithRetries` instance.
     * @returns A new `StructuredChatOutputParserWithRetries` instance.
     */
    static fromLLM(llm, options) {
        const baseParser = options.baseParser ??
            new StructuredChatOutputParser({ toolNames: options.toolNames ?? [] });
        const outputFixingParser = fix_js_1.OutputFixingParser.fromLLM(llm, baseParser);
        return new StructuredChatOutputParserWithRetries({
            baseParser,
            outputFixingParser,
            toolNames: options.toolNames,
        });
    }
}
exports.StructuredChatOutputParserWithRetries = StructuredChatOutputParserWithRetries;
