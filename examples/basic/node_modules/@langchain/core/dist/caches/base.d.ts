import type { Generation } from "../outputs.js";
import { type StoredGeneration } from "../messages/base.js";
/**
 * This cache key should be consistent across all versions of LangChain.
 * It is currently NOT consistent across versions of LangChain.
 *
 * A huge benefit of having a remote cache (like redis) is that you can
 * access the cache from different processes/machines. The allows you to
 * separate concerns and scale horizontally.
 *
 * TODO: Make cache key consistent across versions of LangChain.
 */
export declare const getCacheKey: (...strings: string[]) => string;
export declare function deserializeStoredGeneration(storedGeneration: StoredGeneration): {
    text: string;
    message: import("../messages/tool.js").ToolMessage | import("../messages/ai.js").AIMessage | import("../messages/chat.js").ChatMessage | import("../messages/function.js").FunctionMessage | import("../messages/human.js").HumanMessage | import("../messages/system.js").SystemMessage;
} | {
    text: string;
    message?: undefined;
};
export declare function serializeGeneration(generation: Generation): StoredGeneration;
/**
 * Base class for all caches. All caches should extend this class.
 */
export declare abstract class BaseCache<T = Generation[]> {
    abstract lookup(prompt: string, llmKey: string): Promise<T | null>;
    abstract update(prompt: string, llmKey: string, value: T): Promise<void>;
}
/**
 * A cache for storing LLM generations that stores data in memory.
 */
export declare class InMemoryCache<T = Generation[]> extends BaseCache<T> {
    private cache;
    constructor(map?: Map<string, T>);
    /**
     * Retrieves data from the cache using a prompt and an LLM key. If the
     * data is not found, it returns null.
     * @param prompt The prompt used to find the data.
     * @param llmKey The LLM key used to find the data.
     * @returns The data corresponding to the prompt and LLM key, or null if not found.
     */
    lookup(prompt: string, llmKey: string): Promise<T | null>;
    /**
     * Updates the cache with new data using a prompt and an LLM key.
     * @param prompt The prompt used to store the data.
     * @param llmKey The LLM key used to store the data.
     * @param value The data to be stored.
     */
    update(prompt: string, llmKey: string, value: T): Promise<void>;
    /**
     * Returns a global instance of InMemoryCache using a predefined global
     * map as the initial cache.
     * @returns A global instance of InMemoryCache.
     */
    static global(): InMemoryCache;
}
