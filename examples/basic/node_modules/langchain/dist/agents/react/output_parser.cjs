"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReActSingleInputOutputParser = void 0;
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const types_js_1 = require("../types.cjs");
const prompt_js_1 = require("./prompt.cjs");
const FINAL_ANSWER_ACTION = "Final Answer:";
const FINAL_ANSWER_AND_PARSABLE_ACTION_ERROR_MESSAGE = "Parsing LLM output produced both a final answer and a parse-able action:";
/**
 * Parses ReAct-style LLM calls that have a single tool input.
 *
 * Expects output to be in one of two formats.
 *
 * If the output signals that an action should be taken,
 * should be in the below format. This will result in an AgentAction
 * being returned.
 *
 * ```
 * Thought: agent thought here
 * Action: search
 * Action Input: what is the temperature in SF?
 * ```
 *
 * If the output signals that a final answer should be given,
 * should be in the below format. This will result in an AgentFinish
 * being returned.
 *
 * ```
 * Thought: agent thought here
 * Final Answer: The temperature is 100 degrees
 * ```
 * @example
 * ```typescript
 *
 * const runnableAgent = RunnableSequence.from([
 *   ...rest of runnable
 *   new ReActSingleInputOutputParser({ toolNames: ["SerpAPI", "Calculator"] }),
 * ]);
 * const agent = AgentExecutor.fromAgentAndTools({
 *   agent: runnableAgent,
 *   tools: [new SerpAPI(), new Calculator()],
 * });
 * const result = await agent.invoke({
 *   input: "whats the weather in pomfret?",
 * });
 * ```
 */
class ReActSingleInputOutputParser extends types_js_1.AgentActionOutputParser {
    constructor(fields) {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "react"]
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
     * Parses the given text into an AgentAction or AgentFinish object. If an
     * output fixing parser is defined, uses it to parse the text.
     * @param text Text to parse.
     * @returns Promise that resolves to an AgentAction or AgentFinish object.
     */
    async parse(text) {
        const includesAnswer = text.includes(FINAL_ANSWER_ACTION);
        const regex = /Action\s*\d*\s*:[\s]*(.*?)[\s]*Action\s*\d*\s*Input\s*\d*\s*:[\s]*(.*)/;
        const actionMatch = text.match(regex);
        if (actionMatch) {
            if (includesAnswer) {
                throw new output_parsers_1.OutputParserException(`${FINAL_ANSWER_AND_PARSABLE_ACTION_ERROR_MESSAGE}: ${text}`);
            }
            const action = actionMatch[1];
            const actionInput = actionMatch[2];
            const toolInput = actionInput.trim().replace(/"/g, "");
            return {
                tool: action,
                toolInput,
                log: text,
            };
        }
        if (includesAnswer) {
            const finalAnswerText = text.split(FINAL_ANSWER_ACTION)[1].trim();
            return {
                returnValues: {
                    output: finalAnswerText,
                },
                log: text,
            };
        }
        throw new output_parsers_1.OutputParserException(`Could not parse LLM output: ${text}`);
    }
    /**
     * Returns the format instructions as a string. If the 'raw' option is
     * true, returns the raw FORMAT_INSTRUCTIONS.
     * @param options Options for getting the format instructions.
     * @returns Format instructions as a string.
     */
    getFormatInstructions() {
        return (0, prompts_1.renderTemplate)(prompt_js_1.FORMAT_INSTRUCTIONS, "f-string", {
            tool_names: this.toolNames.join(", "),
        });
    }
}
exports.ReActSingleInputOutputParser = ReActSingleInputOutputParser;
