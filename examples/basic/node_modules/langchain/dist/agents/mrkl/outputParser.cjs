"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeroShotAgentOutputParser = exports.FINAL_ANSWER_ACTION = void 0;
const output_parsers_1 = require("@langchain/core/output_parsers");
const types_js_1 = require("../types.cjs");
const prompt_js_1 = require("./prompt.cjs");
exports.FINAL_ANSWER_ACTION = "Final Answer:";
/**
 * A class that extends `AgentActionOutputParser` to provide a custom
 * implementation for parsing the output of a ZeroShotAgent action.
 */
class ZeroShotAgentOutputParser extends types_js_1.AgentActionOutputParser {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "mrkl"]
        });
        Object.defineProperty(this, "finishToolName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.finishToolName = fields?.finishToolName || exports.FINAL_ANSWER_ACTION;
    }
    /**
     * Parses the text output of an agent action, extracting the tool, tool
     * input, and output.
     * @param text The text output of an agent action.
     * @returns An object containing the tool, tool input, and output extracted from the text, along with the original text as a log.
     */
    async parse(text) {
        if (text.includes(this.finishToolName)) {
            const parts = text.split(this.finishToolName);
            const output = parts[parts.length - 1].trim();
            return {
                returnValues: { output },
                log: text,
            };
        }
        const match = /Action:([\s\S]*?)(?:\nAction Input:([\s\S]*?))?$/.exec(text);
        if (!match) {
            throw new output_parsers_1.OutputParserException(`Could not parse LLM output: ${text}`);
        }
        return {
            tool: match[1].trim(),
            toolInput: match[2]
                ? match[2].trim().replace(/^("+)(.*?)(\1)$/, "$2")
                : "",
            log: text,
        };
    }
    /**
     * Returns the format instructions for parsing the output of an agent
     * action in the style of the ZeroShotAgent.
     * @returns The format instructions for parsing the output.
     */
    getFormatInstructions() {
        return prompt_js_1.FORMAT_INSTRUCTIONS;
    }
}
exports.ZeroShotAgentOutputParser = ZeroShotAgentOutputParser;
