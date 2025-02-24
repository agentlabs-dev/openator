import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { BaseLLMOutputParser } from "@langchain/core/output_parsers";
import { ChainValues } from "@langchain/core/utils/types";
import { ChatGeneration, Generation } from "@langchain/core/outputs";
import { BasePromptTemplate } from "@langchain/core/prompts";
import { Callbacks, BaseCallbackConfig } from "@langchain/core/callbacks/manager";
import { EvalOutputType, LLMEvalChainInput, LLMPairwiseStringEvaluator, LLMPairwiseStringEvaluatorArgs, type ExtractLLMCallOptions } from "../base.js";
import { CriteriaLike } from "../criteria/criteria.js";
/**
 * A parser for the output of the PairwiseStringEvalChain.
 */
export declare class PairwiseStringResultOutputParser extends BaseLLMOutputParser<EvalOutputType> {
    static lc_name(): string;
    lc_namespace: string[];
    parseResult(generations: Generation[] | ChatGeneration[], _callbacks: Callbacks | undefined): Promise<EvalOutputType>;
}
/**
 * A chain for comparing two outputs, such as the outputs
 * of two models, prompts, or outputs of a single model on similar inputs.
 */
export declare class PairwiseStringEvalChain extends LLMPairwiseStringEvaluator {
    static lc_name(): string;
    criterionName?: string;
    evaluationName?: string;
    requiresInput: boolean;
    requiresReference: boolean;
    skipReferenceWarning: string;
    outputParser: PairwiseStringResultOutputParser;
    static resolvePairwiseCriteria(criteria?: CriteriaLike): Record<string, string>;
    static resolvePairwisePrompt(prompt?: BasePromptTemplate): BasePromptTemplate<any, import("@langchain/core/prompt_values").BasePromptValueInterface, any>;
    /**
     * Create a new instance of the PairwiseStringEvalChain.
     * @param llm
     * @param criteria The criteria to use for evaluation.
     * @param chainOptions Options to pass to the chain.
     */
    static fromLLM(llm: BaseLanguageModelInterface, criteria?: CriteriaLike, chainOptions?: Partial<Omit<LLMEvalChainInput, "llm">>): Promise<PairwiseStringEvalChain>;
    _prepareOutput(result: ChainValues): any;
    _evaluateStringPairs(args: LLMPairwiseStringEvaluatorArgs, callOptions: ExtractLLMCallOptions<this["llm"]>, config?: Callbacks | BaseCallbackConfig): Promise<ChainValues>;
}
/**
 * A chain for comparing two outputs, such as the outputs
 * of two models, prompts, or outputs of a single model on similar inputs,
 * with labeled preferences.
 */
export declare class LabeledPairwiseStringEvalChain extends PairwiseStringEvalChain {
    static lc_name(): string;
    requiresReference: boolean;
    static resolvePairwisePrompt(prompt?: BasePromptTemplate): BasePromptTemplate<any, import("@langchain/core/prompt_values").BasePromptValueInterface, any>;
}
