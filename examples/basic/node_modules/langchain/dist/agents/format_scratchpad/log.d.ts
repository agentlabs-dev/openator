import { AgentStep } from "@langchain/core/agents";
/**
 * Construct the scratchpad that lets the agent continue its thought process.
 * @param intermediateSteps
 * @param observationPrefix
 * @param llmPrefix
 * @returns a string with the formatted observations and agent logs
 */
export declare function formatLogToString(intermediateSteps: AgentStep[], observationPrefix?: string, llmPrefix?: string): string;
