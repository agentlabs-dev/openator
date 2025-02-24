import { BaseRetriever, type BaseRetrieverInput } from "@langchain/core/retrievers";
import type { VectorStoreInterface } from "@langchain/core/vectorstores";
import { Document } from "@langchain/core/documents";
import { BaseStore, type BaseStoreInterface } from "@langchain/core/stores";
/**
 * Arguments for the MultiVectorRetriever class.
 */
export interface MultiVectorRetrieverInput extends BaseRetrieverInput {
    vectorstore: VectorStoreInterface;
    /** @deprecated Prefer `byteStore`. */
    docstore?: BaseStoreInterface<string, Document>;
    byteStore?: BaseStore<string, Uint8Array>;
    idKey?: string;
    childK?: number;
    parentK?: number;
}
/**
 * A retriever that retrieves documents from a vector store and a document
 * store. It uses the vector store to find relevant documents based on a
 * query, and then retrieves the full documents from the document store.
 * @example
 * ```typescript
 * const retriever = new MultiVectorRetriever({
 *   vectorstore: new FaissStore(),
 *   byteStore: new InMemoryStore<Unit8Array>(),
 *   idKey: "doc_id",
 *   childK: 20,
 *   parentK: 5,
 * });
 *
 * const retrieverResult = await retriever.getRelevantDocuments("justice breyer");
 * console.log(retrieverResult[0].pageContent.length);
 * ```
 */
export declare class MultiVectorRetriever extends BaseRetriever {
    static lc_name(): string;
    lc_namespace: string[];
    vectorstore: VectorStoreInterface;
    docstore: BaseStoreInterface<string, Document>;
    protected idKey: string;
    protected childK?: number;
    protected parentK?: number;
    constructor(args: MultiVectorRetrieverInput);
    _getRelevantDocuments(query: string): Promise<Document[]>;
}
