import type { AgentStep } from "@langchain/core/agents";
import { type BaseMessage } from "@langchain/core/messages";
export declare function formatLogToMessage(intermediateSteps: AgentStep[], templateToolResponse?: string): BaseMessage[];
