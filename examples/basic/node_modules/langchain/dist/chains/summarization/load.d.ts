import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { BasePromptTemplate } from "@langchain/core/prompts";
import { StuffDocumentsChain, MapReduceDocumentsChain, RefineDocumentsChain, MapReduceDocumentsChainInput } from "../combine_docs_chain.js";
/**
 * Type for the base parameters that can be used to configure a
 * summarization chain.
 */
type BaseParams = {
    verbose?: boolean;
};
/** @interface */
export type SummarizationChainParams = BaseParams & ({
    type?: "stuff";
    prompt?: BasePromptTemplate;
} | ({
    type?: "map_reduce";
    combineMapPrompt?: BasePromptTemplate;
    combinePrompt?: BasePromptTemplate;
    combineLLM?: BaseLanguageModelInterface;
} & Pick<MapReduceDocumentsChainInput, "returnIntermediateSteps">) | {
    type?: "refine";
    refinePrompt?: BasePromptTemplate;
    refineLLM?: BaseLanguageModelInterface;
    questionPrompt?: BasePromptTemplate;
});
export declare const loadSummarizationChain: (llm: BaseLanguageModelInterface, params?: SummarizationChainParams) => StuffDocumentsChain | MapReduceDocumentsChain | RefineDocumentsChain;
export {};
