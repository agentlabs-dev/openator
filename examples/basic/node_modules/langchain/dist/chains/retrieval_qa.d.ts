import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import type { BaseRetrieverInterface } from "@langchain/core/retrievers";
import { ChainValues } from "@langchain/core/utils/types";
import { CallbackManagerForChainRun } from "@langchain/core/callbacks/manager";
import { BaseChain, ChainInputs } from "./base.js";
import { SerializedVectorDBQAChain } from "./serde.js";
import { StuffQAChainParams } from "./question_answering/load.js";
export type LoadValues = Record<string, any>;
/**
 * Interface for the input parameters of the RetrievalQAChain class.
 */
export interface RetrievalQAChainInput extends Omit<ChainInputs, "memory"> {
    retriever: BaseRetrieverInterface;
    combineDocumentsChain: BaseChain;
    inputKey?: string;
    returnSourceDocuments?: boolean;
}
/**
 * @deprecated This class will be removed in 1.0.0. See below for an example implementation using
 * `createRetrievalChain`:
 * Class representing a chain for performing question-answering tasks with
 * a retrieval component.
 * @example
 * ```typescript
 * import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
 * import { ChatPromptTemplate } from "@langchain/core/prompts";
 * import { createRetrievalChain } from "langchain/chains/retrieval";
 * import { MemoryVectorStore } from "langchain/vectorstores/memory";
 *
 * const documents = [...your documents here];
 * const embeddings = ...your embeddings model;
 * const llm = ...your LLM model;
 *
 * const vectorstore = await MemoryVectorStore.fromDocuments(
 *   documents,
 *   embeddings
 * );
 * const prompt = ChatPromptTemplate.fromTemplate(`Answer the user's question: {input} based on the following context {context}`);
 *
 * const combineDocsChain = await createStuffDocumentsChain({
 *   llm,
 *   prompt,
 * });
 * const retriever = vectorstore.asRetriever();
 *
 * const retrievalChain = await createRetrievalChain({
 *   combineDocsChain,
 *   retriever,
 * });
 * ```
 */
export declare class RetrievalQAChain extends BaseChain implements RetrievalQAChainInput {
    static lc_name(): string;
    inputKey: string;
    get inputKeys(): string[];
    get outputKeys(): string[];
    retriever: BaseRetrieverInterface;
    combineDocumentsChain: BaseChain;
    returnSourceDocuments: boolean;
    constructor(fields: RetrievalQAChainInput);
    /** @ignore */
    _call(values: ChainValues, runManager?: CallbackManagerForChainRun): Promise<ChainValues>;
    _chainType(): "retrieval_qa";
    static deserialize(_data: SerializedVectorDBQAChain, _values: LoadValues): Promise<RetrievalQAChain>;
    serialize(): SerializedVectorDBQAChain;
    /**
     * Creates a new instance of RetrievalQAChain using a BaseLanguageModel
     * and a BaseRetriever.
     * @param llm The BaseLanguageModel used to generate a new question.
     * @param retriever The BaseRetriever used to retrieve relevant documents.
     * @param options Optional parameters for the RetrievalQAChain.
     * @returns A new instance of RetrievalQAChain.
     */
    static fromLLM(llm: BaseLanguageModelInterface, retriever: BaseRetrieverInterface, options?: Partial<Omit<RetrievalQAChainInput, "retriever" | "combineDocumentsChain" | "index">> & StuffQAChainParams): RetrievalQAChain;
}
