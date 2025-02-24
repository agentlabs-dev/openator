import { ChatOpenAI } from "@langchain/openai";
import { InputValues, MemoryVariables, OutputValues } from "@langchain/core/memory";
import { BaseChatMemory, BaseChatMemoryInput } from "../../../memory/chat_memory.js";
/**
 * Type definition for the fields required to initialize an instance of
 * OpenAIAgentTokenBufferMemory.
 */
export type OpenAIAgentTokenBufferMemoryFields = BaseChatMemoryInput & {
    llm: ChatOpenAI;
    humanPrefix?: string;
    aiPrefix?: string;
    memoryKey?: string;
    maxTokenLimit?: number;
    returnMessages?: boolean;
    outputKey?: string;
    intermediateStepsKey?: string;
};
/**
 * Memory used to save agent output and intermediate steps.
 */
export declare class OpenAIAgentTokenBufferMemory extends BaseChatMemory {
    humanPrefix: string;
    aiPrefix: string;
    llm: ChatOpenAI;
    memoryKey: string;
    maxTokenLimit: number;
    returnMessages: boolean;
    outputKey: string;
    intermediateStepsKey: string;
    constructor(fields: OpenAIAgentTokenBufferMemoryFields);
    get memoryKeys(): string[];
    /**
     * Retrieves the messages from the chat history.
     * @returns Promise that resolves with the messages from the chat history.
     */
    getMessages(): Promise<import("@langchain/core/messages").BaseMessage[]>;
    /**
     * Loads memory variables from the input values.
     * @param _values Input values.
     * @returns Promise that resolves with the loaded memory variables.
     */
    loadMemoryVariables(_values: InputValues): Promise<MemoryVariables>;
    /**
     * Saves the context of the chat, including user input, AI output, and
     * intermediate steps. Prunes the chat history if the total token count
     * exceeds the maximum limit.
     * @param inputValues Input values.
     * @param outputValues Output values.
     * @returns Promise that resolves when the context has been saved.
     */
    saveContext(inputValues: InputValues, outputValues: OutputValues): Promise<void>;
}
