import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Tool, DynamicStructuredTool } from "@langchain/core/tools";
export declare const PLANNER_SYSTEM_PROMPT_MESSAGE_TEMPLATE: string;
export declare const DEFAULT_STEP_EXECUTOR_HUMAN_CHAT_MESSAGE_TEMPLATE = "Previous steps: {previous_steps}\n\nCurrent objective: {current_step}\n\n{agent_scratchpad}\n\nYou may extract and combine relevant data from your previous steps when responding to me.";
/**
 * Add the tool descriptions to the planning system prompt in
 * order to get a better suited plan that makes efficient use
 * of the tools
 * @param tools the tools available to the `planner`
 * @returns
 */
export declare const getPlannerChatPrompt: (tools: Tool[] | DynamicStructuredTool[]) => Promise<ChatPromptTemplate<import("@langchain/core/utils/types").InputValues<string>, any>>;
