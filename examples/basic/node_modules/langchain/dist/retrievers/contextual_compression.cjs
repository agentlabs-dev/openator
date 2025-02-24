"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextualCompressionRetriever = void 0;
const retrievers_1 = require("@langchain/core/retrievers");
/**
 * A retriever that wraps a base retriever and compresses the results. It
 * retrieves relevant documents based on a given query and then compresses
 * these documents using a specified document compressor.
 * @example
 * ```typescript
 * const retriever = new ContextualCompressionRetriever({
 *   baseCompressor: new LLMChainExtractor(),
 *   baseRetriever: new HNSWLib().asRetriever(),
 * });
 * const retrievedDocs = await retriever.getRelevantDocuments(
 *   "What did the speaker say about Justice Breyer?",
 * );
 * ```
 */
class ContextualCompressionRetriever extends retrievers_1.BaseRetriever {
    static lc_name() {
        return "ContextualCompressionRetriever";
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "retrievers", "contextual_compression"]
        });
        Object.defineProperty(this, "baseCompressor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "baseRetriever", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.baseCompressor = fields.baseCompressor;
        this.baseRetriever = fields.baseRetriever;
    }
    async _getRelevantDocuments(query, runManager) {
        const docs = await this.baseRetriever.getRelevantDocuments(query, runManager?.getChild("base_retriever"));
        const compressedDocs = await this.baseCompressor.compressDocuments(docs, query, runManager?.getChild("base_compressor"));
        return compressedDocs;
    }
}
exports.ContextualCompressionRetriever = ContextualCompressionRetriever;
