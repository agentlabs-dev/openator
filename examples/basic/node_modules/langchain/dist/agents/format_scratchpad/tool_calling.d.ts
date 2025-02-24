import { BaseMessage, ToolMessage } from "@langchain/core/messages";
import { ToolsAgentStep } from "../tool_calling/output_parser.js";
/**
 * Convert agent action and observation into a function message.
 * @param agentAction - The tool invocation request from the agent
 * @param observation - The result of the tool invocation
 * @returns FunctionMessage that corresponds to the original tool invocation
 */
export declare function _createToolMessage(step: ToolsAgentStep): ToolMessage;
export declare function formatToToolMessages(steps: ToolsAgentStep[]): BaseMessage[];
