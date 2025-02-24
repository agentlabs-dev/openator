import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { InputValues, MemoryVariables, OutputValues } from "@langchain/core/memory";
import { BaseChatMemory, BaseChatMemoryInput } from "./chat_memory.js";
/**
 * Interface for the input parameters of the `BufferTokenMemory` class.
 */
export interface ConversationTokenBufferMemoryInput extends BaseChatMemoryInput {
    humanPrefix?: string;
    aiPrefix?: string;
    llm: BaseLanguageModelInterface;
    memoryKey?: string;
    maxTokenLimit?: number;
}
/**
 * Class that represents a conversation chat memory with a token buffer.
 * It extends the `BaseChatMemory` class and implements the
 * `ConversationTokenBufferMemoryInput` interface.
 * @example
 * ```typescript
 * const memory = new ConversationTokenBufferMemory({
 *   llm: new ChatOpenAI({}),
 *   maxTokenLimit: 10,
 * });
 *
 * // Save conversation context
 * await memory.saveContext({ input: "hi" }, { output: "whats up" });
 * await memory.saveContext({ input: "not much you" }, { output: "not much" });
 *
 * // Load memory variables
 * const result = await memory.loadMemoryVariables({});
 * console.log(result);
 * ```
 */
export declare class ConversationTokenBufferMemory extends BaseChatMemory implements ConversationTokenBufferMemoryInput {
    humanPrefix: string;
    aiPrefix: string;
    memoryKey: string;
    maxTokenLimit: number;
    llm: BaseLanguageModelInterface;
    constructor(fields: ConversationTokenBufferMemoryInput);
    get memoryKeys(): string[];
    /**
     * Loads the memory variables. It takes an `InputValues` object as a
     * parameter and returns a `Promise` that resolves with a
     * `MemoryVariables` object.
     * @param _values `InputValues` object.
     * @returns A `Promise` that resolves with a `MemoryVariables` object.
     */
    loadMemoryVariables(_values: InputValues): Promise<MemoryVariables>;
    /**
     * Saves the context from this conversation to buffer. If the amount
     * of tokens required to save the buffer exceeds MAX_TOKEN_LIMIT,
     * prune it.
     */
    saveContext(inputValues: InputValues, outputValues: OutputValues): Promise<void>;
}
