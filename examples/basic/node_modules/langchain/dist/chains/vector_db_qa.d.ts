import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import type { VectorStoreInterface } from "@langchain/core/vectorstores";
import { CallbackManagerForChainRun } from "@langchain/core/callbacks/manager";
import { ChainValues } from "@langchain/core/utils/types";
import { BaseChain, ChainInputs } from "./base.js";
import { SerializedVectorDBQAChain } from "./serde.js";
export type LoadValues = Record<string, any>;
/**
 * Interface that extends the `ChainInputs` interface and defines the
 * input fields required for a VectorDBQAChain. It includes properties
 * such as `vectorstore`, `combineDocumentsChain`,
 * `returnSourceDocuments`, `k`, and `inputKey`.
 *
 * @deprecated
 * Switch to {@link https://js.langchain.com/docs/modules/chains/ | createRetrievalChain}
 * Will be removed in 0.2.0
 */
export interface VectorDBQAChainInput extends Omit<ChainInputs, "memory"> {
    vectorstore: VectorStoreInterface;
    combineDocumentsChain: BaseChain;
    returnSourceDocuments?: boolean;
    k?: number;
    inputKey?: string;
}
/**
 * Class that represents a VectorDBQAChain. It extends the `BaseChain`
 * class and implements the `VectorDBQAChainInput` interface. It performs
 * a similarity search using a vector store and combines the search
 * results using a specified combine documents chain.
 *
 * @deprecated
 * Switch to {@link https://js.langchain.com/docs/modules/chains/ | createRetrievalChain}
 * Will be removed in 0.2.0
 */
export declare class VectorDBQAChain extends BaseChain implements VectorDBQAChainInput {
    static lc_name(): string;
    k: number;
    inputKey: string;
    get inputKeys(): string[];
    get outputKeys(): string[];
    vectorstore: VectorStoreInterface;
    combineDocumentsChain: BaseChain;
    returnSourceDocuments: boolean;
    constructor(fields: VectorDBQAChainInput);
    /** @ignore */
    _call(values: ChainValues, runManager?: CallbackManagerForChainRun): Promise<ChainValues>;
    _chainType(): "vector_db_qa";
    static deserialize(data: SerializedVectorDBQAChain, values: LoadValues): Promise<VectorDBQAChain>;
    serialize(): SerializedVectorDBQAChain;
    /**
     * Static method that creates a VectorDBQAChain instance from a
     * BaseLanguageModel and a vector store. It also accepts optional options
     * to customize the chain.
     * @param llm The BaseLanguageModel instance.
     * @param vectorstore The vector store used for similarity search.
     * @param options Optional options to customize the chain.
     * @returns A new instance of VectorDBQAChain.
     */
    static fromLLM(llm: BaseLanguageModelInterface, vectorstore: VectorStoreInterface, options?: Partial<Omit<VectorDBQAChainInput, "combineDocumentsChain" | "vectorstore">>): VectorDBQAChain;
}
