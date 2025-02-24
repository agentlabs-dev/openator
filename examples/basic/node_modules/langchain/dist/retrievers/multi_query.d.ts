import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { BaseRetriever, type BaseRetrieverInput, type BaseRetrieverInterface } from "@langchain/core/retrievers";
import { Document } from "@langchain/core/documents";
import { BasePromptTemplate } from "@langchain/core/prompts";
import { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";
import { LLMChain } from "../chains/llm_chain.js";
import type { BaseDocumentCompressor } from "./document_compressors/index.js";
interface LineList {
    lines: string[];
}
export type MultiDocs = Document<Record<string, any>>[];
export interface MultiQueryRetrieverInput extends BaseRetrieverInput {
    retriever: BaseRetrieverInterface;
    /** @deprecated Pass a custom prompt into `.fromLLM` instead. */
    llmChain: LLMChain<LineList>;
    queryCount?: number;
    parserKey?: string;
    documentCompressor?: BaseDocumentCompressor | undefined;
    documentCompressorFilteringFn?: (docs: MultiDocs) => MultiDocs;
}
/**
 * @example
 * ```typescript
 * const retriever = new MultiQueryRetriever.fromLLM({
 *   llm: new ChatAnthropic({}),
 *   retriever: new MemoryVectorStore().asRetriever(),
 *   verbose: true,
 * });
 * const retrievedDocs = await retriever.getRelevantDocuments(
 *   "What are mitochondria made of?",
 * );
 * ```
 */
export declare class MultiQueryRetriever extends BaseRetriever {
    static lc_name(): string;
    lc_namespace: string[];
    private retriever;
    private llmChain;
    private queryCount;
    private parserKey;
    documentCompressor: BaseDocumentCompressor | undefined;
    documentCompressorFilteringFn?: MultiQueryRetrieverInput["documentCompressorFilteringFn"];
    constructor(fields: MultiQueryRetrieverInput);
    static fromLLM(fields: Omit<MultiQueryRetrieverInput, "llmChain"> & {
        llm: BaseLanguageModelInterface;
        prompt?: BasePromptTemplate;
    }): MultiQueryRetriever;
    private _generateQueries;
    private _retrieveDocuments;
    private _uniqueUnion;
    _getRelevantDocuments(question: string, runManager?: CallbackManagerForRetrieverRun): Promise<Document[]>;
}
export {};
