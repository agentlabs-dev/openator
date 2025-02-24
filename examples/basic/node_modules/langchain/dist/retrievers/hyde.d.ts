import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { Document } from "@langchain/core/documents";
import { BasePromptTemplate } from "@langchain/core/prompts";
import { VectorStore, VectorStoreRetriever, VectorStoreRetrieverInput } from "@langchain/core/vectorstores";
import { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";
/**
 * A string that corresponds to a specific prompt template.
 */
export type PromptKey = "websearch" | "scifact" | "arguana" | "trec-covid" | "fiqa" | "dbpedia-entity" | "trec-news" | "mr-tydi";
/**
 * Options for the HydeRetriever class, which includes a BaseLanguageModel
 * instance, a VectorStore instance, and an optional promptTemplate which
 * can either be a BasePromptTemplate instance or a PromptKey.
 */
export type HydeRetrieverOptions<V extends VectorStore> = VectorStoreRetrieverInput<V> & {
    llm: BaseLanguageModelInterface;
    promptTemplate?: BasePromptTemplate | PromptKey;
};
/**
 * A class for retrieving relevant documents based on a given query. It
 * extends the VectorStoreRetriever class and uses a BaseLanguageModel to
 * generate a hypothetical answer to the query, which is then used to
 * retrieve relevant documents.
 * @example
 * ```typescript
 * const retriever = new HydeRetriever({
 *   vectorStore: new MemoryVectorStore(new OpenAIEmbeddings()),
 *   llm: new ChatOpenAI(),
 *   k: 1,
 * });
 * await vectorStore.addDocuments(
 *   [
 *     "My name is John.",
 *     "My name is Bob.",
 *     "My favourite food is pizza.",
 *     "My favourite food is pasta.",
 *   ].map((pageContent) => new Document({ pageContent })),
 * );
 * const results = await retriever.getRelevantDocuments(
 *   "What is my favourite food?",
 * );
 * ```
 */
export declare class HydeRetriever<V extends VectorStore = VectorStore> extends VectorStoreRetriever<V> {
    static lc_name(): string;
    get lc_namespace(): string[];
    llm: BaseLanguageModelInterface;
    promptTemplate?: BasePromptTemplate;
    constructor(fields: HydeRetrieverOptions<V>);
    _getRelevantDocuments(query: string, runManager?: CallbackManagerForRetrieverRun): Promise<Document[]>;
}
/**
 * Returns a BasePromptTemplate instance based on a given PromptKey.
 */
export declare function getPromptTemplateFromKey(key: PromptKey): BasePromptTemplate;
