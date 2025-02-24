"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolCallingAgentOutputParser = exports.parseAIMessageToToolAction = void 0;
const messages_1 = require("@langchain/core/messages");
const output_parsers_1 = require("@langchain/core/output_parsers");
const types_js_1 = require("../types.cjs");
function parseAIMessageToToolAction(message) {
    const stringifiedMessageContent = typeof message.content === "string"
        ? message.content
        : JSON.stringify(message.content);
    let toolCalls = [];
    if (message.tool_calls !== undefined && message.tool_calls.length > 0) {
        toolCalls = message.tool_calls;
    }
    else {
        if (message.additional_kwargs.tool_calls === undefined ||
            message.additional_kwargs.tool_calls.length === 0) {
            return {
                returnValues: { output: message.content },
                log: stringifiedMessageContent,
            };
        }
        // Best effort parsing
        for (const toolCall of message.additional_kwargs.tool_calls ?? []) {
            const functionName = toolCall.function?.name;
            try {
                const args = JSON.parse(toolCall.function.arguments);
                toolCalls.push({ name: functionName, args, id: toolCall.id });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
            catch (e) {
                throw new output_parsers_1.OutputParserException(`Failed to parse tool arguments from chat model response. Text: "${JSON.stringify(toolCalls)}". ${e}`);
            }
        }
    }
    return toolCalls.map((toolCall, i) => {
        const messageLog = i === 0 ? [message] : [];
        const log = `Invoking "${toolCall.name}" with ${JSON.stringify(toolCall.args ?? {})}\n${stringifiedMessageContent}`;
        return {
            tool: toolCall.name,
            toolInput: toolCall.args,
            toolCallId: toolCall.id ?? "",
            log,
            messageLog,
        };
    });
}
exports.parseAIMessageToToolAction = parseAIMessageToToolAction;
class ToolCallingAgentOutputParser extends types_js_1.AgentMultiActionOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "tool_calling"]
        });
    }
    static lc_name() {
        return "ToolCallingAgentOutputParser";
    }
    async parse(text) {
        throw new Error(`ToolCallingAgentOutputParser can only parse messages.\nPassed input: ${text}`);
    }
    async parseResult(generations) {
        if ("message" in generations[0] && (0, messages_1.isBaseMessage)(generations[0].message)) {
            return parseAIMessageToToolAction(generations[0].message);
        }
        throw new Error("parseResult on ToolCallingAgentOutputParser only works on ChatGeneration output");
    }
    getFormatInstructions() {
        throw new Error("getFormatInstructions not implemented inside ToolCallingAgentOutputParser.");
    }
}
exports.ToolCallingAgentOutputParser = ToolCallingAgentOutputParser;
