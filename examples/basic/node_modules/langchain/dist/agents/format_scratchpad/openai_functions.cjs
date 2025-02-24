"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatToOpenAIFunctionMessages = exports.formatForOpenAIFunctions = void 0;
const messages_1 = require("@langchain/core/messages");
const prompts_1 = require("@langchain/core/prompts");
const prompt_js_1 = require("../chat_convo/prompt.cjs");
/**
 * Format a list of AgentSteps into a list of BaseMessage instances for
 * agents that use OpenAI's API. Helpful for passing in previous agent
 * step context into new iterations.
 *
 * @deprecated Use formatToOpenAIFunctionMessages instead.
 * @param steps A list of AgentSteps to format.
 * @returns A list of BaseMessages.
 */
function formatForOpenAIFunctions(steps) {
    const thoughts = [];
    for (const step of steps) {
        thoughts.push(new messages_1.AIMessage(step.action.log));
        thoughts.push(new messages_1.HumanMessage((0, prompts_1.renderTemplate)(prompt_js_1.TEMPLATE_TOOL_RESPONSE, "f-string", {
            observation: step.observation,
        })));
    }
    return thoughts;
}
exports.formatForOpenAIFunctions = formatForOpenAIFunctions;
/**
 * Format a list of AgentSteps into a list of BaseMessage instances for
 * agents that use OpenAI's API. Helpful for passing in previous agent
 * step context into new iterations.
 *
 * @param steps A list of AgentSteps to format.
 * @returns A list of BaseMessages.
 */
function formatToOpenAIFunctionMessages(steps) {
    return steps.flatMap(({ action, observation }) => {
        if ("messageLog" in action && action.messageLog !== undefined) {
            const log = action.messageLog;
            return log.concat(new messages_1.FunctionMessage(observation, action.tool));
        }
        else {
            return [new messages_1.AIMessage(action.log)];
        }
    });
}
exports.formatToOpenAIFunctionMessages = formatToOpenAIFunctionMessages;
