import { AgentAction, AgentFinish, AgentStep } from "@langchain/core/agents";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { ChatGeneration } from "@langchain/core/outputs";
import { AgentMultiActionOutputParser } from "../types.js";
/**
 * Type that represents an agent action with an optional message log.
 */
export type ToolsAgentAction = AgentAction & {
    toolCallId: string;
    messageLog?: BaseMessage[];
};
export type ToolsAgentStep = AgentStep & {
    action: ToolsAgentAction;
};
export declare function parseAIMessageToToolAction(message: AIMessage): ToolsAgentAction[] | AgentFinish;
export declare class ToolCallingAgentOutputParser extends AgentMultiActionOutputParser {
    lc_namespace: string[];
    static lc_name(): string;
    parse(text: string): Promise<AgentAction[] | AgentFinish>;
    parseResult(generations: ChatGeneration[]): Promise<AgentFinish | ToolsAgentAction[]>;
    getFormatInstructions(): string;
}
