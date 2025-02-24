import { BaseRetriever, type BaseRetrieverInput, type BaseRetrieverInterface } from "@langchain/core/retrievers";
import type { DocumentInterface } from "@langchain/core/documents";
import { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";
import { BaseDocumentCompressor } from "./document_compressors/index.js";
/**
 * Interface for the arguments required to construct a
 * ContextualCompressionRetriever. It extends the BaseRetrieverInput
 * interface with two additional fields: baseCompressor and baseRetriever.
 */
export interface ContextualCompressionRetrieverArgs extends BaseRetrieverInput {
    baseCompressor: BaseDocumentCompressor;
    baseRetriever: BaseRetrieverInterface;
}
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
export declare class ContextualCompressionRetriever extends BaseRetriever {
    static lc_name(): string;
    lc_namespace: string[];
    baseCompressor: BaseDocumentCompressor;
    baseRetriever: BaseRetrieverInterface;
    constructor(fields: ContextualCompressionRetrieverArgs);
    _getRelevantDocuments(query: string, runManager?: CallbackManagerForRetrieverRun): Promise<DocumentInterface[]>;
}
