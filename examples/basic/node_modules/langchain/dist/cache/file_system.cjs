"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalFileCache = void 0;
const node_path_1 = __importDefault(require("node:path"));
const promises_1 = __importDefault(require("node:fs/promises"));
const caches_1 = require("@langchain/core/caches");
/**
 * A cache that uses the local filesystem as the backing store.
 * This is useful for local development and testing. But it is not recommended for production use.
 */
class LocalFileCache extends caches_1.BaseCache {
    constructor(cacheDir) {
        super();
        Object.defineProperty(this, "cacheDir", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.cacheDir = cacheDir;
    }
    /**
     * Create a new cache backed by the local filesystem.
     * It ensures that the cache directory exists before returning.
     * @param cacheDir
     */
    static async create(cacheDir) {
        if (!cacheDir) {
            // eslint-disable-next-line no-param-reassign
            cacheDir = await promises_1.default.mkdtemp("langchain-cache-");
        }
        else {
            // ensure the cache directory exists
            await promises_1.default.mkdir(cacheDir, { recursive: true });
        }
        return new LocalFileCache(cacheDir);
    }
    /**
     * Retrieves data from the cache. It constructs a cache key from the given
     * `prompt` and `llmKey`, and retrieves the corresponding value from the
     * cache files.
     * @param prompt The prompt used to construct the cache key.
     * @param llmKey The LLM key used to construct the cache key.
     * @returns An array of Generations if found, null otherwise.
     */
    async lookup(prompt, llmKey) {
        const key = `${(0, caches_1.getCacheKey)(prompt, llmKey)}.json`;
        try {
            const content = await promises_1.default.readFile(node_path_1.default.join(this.cacheDir, key));
            return JSON.parse(content.toString()).map(caches_1.deserializeStoredGeneration);
        }
        catch {
            return null;
        }
    }
    /**
     * Updates the cache with new data. It constructs a cache key from the
     * given `prompt` and `llmKey`, and stores the `value` in a specific
     * file in the cache directory.
     * @param prompt The prompt used to construct the cache key.
     * @param llmKey The LLM key used to construct the cache key.
     * @param generations The value to be stored in the cache.
     */
    async update(prompt, llmKey, generations) {
        const key = `${(0, caches_1.getCacheKey)(prompt, llmKey)}.json`;
        await promises_1.default.writeFile(node_path_1.default.join(this.cacheDir, key), JSON.stringify(generations.map(caches_1.serializeGeneration)));
    }
}
exports.LocalFileCache = LocalFileCache;
