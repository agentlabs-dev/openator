import { type BaseMessage, type BaseMessageChunk } from "./messages/base.js";
export declare const RUN_KEY = "__run";
/**
 * Output of a single generation.
 */
export interface Generation {
    /**
     * Generated text output
     */
    text: string;
    /**
     * Raw generation info response from the provider.
     * May include things like reason for finishing (e.g. in {@link OpenAI})
     */
    generationInfo?: Record<string, any>;
}
export type GenerationChunkFields = {
    text: string;
    generationInfo?: Record<string, any>;
};
/**
 * Chunk of a single generation. Used for streaming.
 */
export declare class GenerationChunk implements Generation {
    text: string;
    generationInfo?: Record<string, any>;
    constructor(fields: GenerationChunkFields);
    concat(chunk: GenerationChunk): GenerationChunk;
}
/**
 * Contains all relevant information returned by an LLM.
 */
export type LLMResult = {
    /**
     * List of the things generated. Each input could have multiple {@link Generation | generations}, hence this is a list of lists.
     */
    generations: Generation[][];
    /**
     * Dictionary of arbitrary LLM-provider specific output.
     */
    llmOutput?: Record<string, any>;
    /**
     * Dictionary of run metadata
     */
    [RUN_KEY]?: Record<string, any>;
};
export interface ChatGeneration extends Generation {
    message: BaseMessage;
}
export type ChatGenerationChunkFields = GenerationChunkFields & {
    message: BaseMessageChunk;
};
export declare class ChatGenerationChunk extends GenerationChunk implements ChatGeneration {
    message: BaseMessageChunk;
    constructor(fields: ChatGenerationChunkFields);
    concat(chunk: ChatGenerationChunk): ChatGenerationChunk;
}
export interface ChatResult {
    generations: ChatGeneration[];
    llmOutput?: Record<string, any>;
}
