"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRetriever = void 0;
const manager_js_1 = require("../callbacks/manager.cjs");
const base_js_1 = require("../runnables/base.cjs");
const config_js_1 = require("../runnables/config.cjs");
/**
 * Abstract base class for a document retrieval system, designed to
 * process string queries and return the most relevant documents from a source.
 *
 * `BaseRetriever` provides common properties and methods for derived retrievers,
 * such as callbacks, tagging, and verbose logging. Custom retrieval systems
 * should extend this class and implement `_getRelevantDocuments` to define
 * the specific retrieval logic.
 *
 * @template Metadata - The type of metadata associated with each document,
 *                      defaulting to `Record<string, any>`.
 */
class BaseRetriever extends base_js_1.Runnable {
    /**
     * Constructs a new `BaseRetriever` instance with optional configuration fields.
     *
     * @param fields - Optional input configuration that can include `callbacks`,
     *                 `tags`, `metadata`, and `verbose` settings for custom retriever behavior.
     */
    constructor(fields) {
        super(fields);
        /**
         * Optional callbacks to handle various events in the retrieval process.
         */
        Object.defineProperty(this, "callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Tags to label or categorize the retrieval operation.
         */
        Object.defineProperty(this, "tags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Metadata to provide additional context or information about the retrieval
         * operation.
         */
        Object.defineProperty(this, "metadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * If set to `true`, enables verbose logging for the retrieval process.
         */
        Object.defineProperty(this, "verbose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.callbacks = fields?.callbacks;
        this.tags = fields?.tags ?? [];
        this.metadata = fields?.metadata ?? {};
        this.verbose = fields?.verbose ?? false;
    }
    /**
     * TODO: This should be an abstract method, but we'd like to avoid breaking
     * changes to people currently using subclassed custom retrievers.
     * Change it on next major release.
     */
    /**
     * Placeholder method for retrieving relevant documents based on a query.
     *
     * This method is intended to be implemented by subclasses and will be
     * converted to an abstract method in the next major release. Currently, it
     * throws an error if not implemented, ensuring that custom retrievers define
     * the specific retrieval logic.
     *
     * @param _query - The query string used to search for relevant documents.
     * @param _callbacks - (optional) Callback manager for managing callbacks
     *                     during retrieval.
     * @returns A promise resolving to an array of `DocumentInterface` instances relevant to the query.
     * @throws {Error} Throws an error indicating the method is not implemented.
     */
    _getRelevantDocuments(_query, _callbacks) {
        throw new Error("Not implemented!");
    }
    /**
     * Executes a retrieval operation.
     *
     * @param input - The query string used to search for relevant documents.
     * @param options - (optional) Configuration options for the retrieval run,
     *                  which may include callbacks, tags, and metadata.
     * @returns A promise that resolves to an array of `DocumentInterface` instances
     *          representing the most relevant documents to the query.
     */
    async invoke(input, options) {
        return this.getRelevantDocuments(input, (0, config_js_1.ensureConfig)(options));
    }
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.3.0.
     *
     * Main method used to retrieve relevant documents. It takes a query
     * string and an optional configuration object, and returns a promise that
     * resolves to an array of `Document` objects. This method handles the
     * retrieval process, including starting and ending callbacks, and error
     * handling.
     * @param query The query string to retrieve relevant documents for.
     * @param config Optional configuration object for the retrieval process.
     * @returns A promise that resolves to an array of `Document` objects.
     */
    async getRelevantDocuments(query, config) {
        const parsedConfig = (0, config_js_1.ensureConfig)((0, manager_js_1.parseCallbackConfigArg)(config));
        const callbackManager_ = await manager_js_1.CallbackManager.configure(parsedConfig.callbacks, this.callbacks, parsedConfig.tags, this.tags, parsedConfig.metadata, this.metadata, { verbose: this.verbose });
        const runManager = await callbackManager_?.handleRetrieverStart(this.toJSON(), query, parsedConfig.runId, undefined, undefined, undefined, parsedConfig.runName);
        try {
            const results = await this._getRelevantDocuments(query, runManager);
            await runManager?.handleRetrieverEnd(results);
            return results;
        }
        catch (error) {
            await runManager?.handleRetrieverError(error);
            throw error;
        }
    }
}
exports.BaseRetriever = BaseRetriever;
