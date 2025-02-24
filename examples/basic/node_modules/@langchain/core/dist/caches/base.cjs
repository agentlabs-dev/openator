"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCache = exports.BaseCache = exports.serializeGeneration = exports.deserializeStoredGeneration = exports.getCacheKey = void 0;
const hash_js_1 = require("../utils/hash.cjs");
const utils_js_1 = require("../messages/utils.cjs");
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
const getCacheKey = (...strings) => (0, hash_js_1.insecureHash)(strings.join("_"));
exports.getCacheKey = getCacheKey;
function deserializeStoredGeneration(storedGeneration) {
    if (storedGeneration.message !== undefined) {
        return {
            text: storedGeneration.text,
            message: (0, utils_js_1.mapStoredMessageToChatMessage)(storedGeneration.message),
        };
    }
    else {
        return { text: storedGeneration.text };
    }
}
exports.deserializeStoredGeneration = deserializeStoredGeneration;
function serializeGeneration(generation) {
    const serializedValue = {
        text: generation.text,
    };
    if (generation.message !== undefined) {
        serializedValue.message = generation.message.toDict();
    }
    return serializedValue;
}
exports.serializeGeneration = serializeGeneration;
/**
 * Base class for all caches. All caches should extend this class.
 */
class BaseCache {
}
exports.BaseCache = BaseCache;
const GLOBAL_MAP = new Map();
/**
 * A cache for storing LLM generations that stores data in memory.
 */
class InMemoryCache extends BaseCache {
    constructor(map) {
        super();
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.cache = map ?? new Map();
    }
    /**
     * Retrieves data from the cache using a prompt and an LLM key. If the
     * data is not found, it returns null.
     * @param prompt The prompt used to find the data.
     * @param llmKey The LLM key used to find the data.
     * @returns The data corresponding to the prompt and LLM key, or null if not found.
     */
    lookup(prompt, llmKey) {
        return Promise.resolve(this.cache.get((0, exports.getCacheKey)(prompt, llmKey)) ?? null);
    }
    /**
     * Updates the cache with new data using a prompt and an LLM key.
     * @param prompt The prompt used to store the data.
     * @param llmKey The LLM key used to store the data.
     * @param value The data to be stored.
     */
    async update(prompt, llmKey, value) {
        this.cache.set((0, exports.getCacheKey)(prompt, llmKey), value);
    }
    /**
     * Returns a global instance of InMemoryCache using a predefined global
     * map as the initial cache.
     * @returns A global instance of InMemoryCache.
     */
    static global() {
        return new InMemoryCache(GLOBAL_MAP);
    }
}
exports.InMemoryCache = InMemoryCache;
