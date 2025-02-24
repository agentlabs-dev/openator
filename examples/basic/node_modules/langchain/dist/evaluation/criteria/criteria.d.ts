import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { BaseLLMOutputParser } from "@langchain/core/output_parsers";
import { ChainValues } from "@langchain/core/utils/types";
import { ChatGeneration, Generation } from "@langchain/core/outputs";
import { BasePromptTemplate } from "@langchain/core/prompts";
import { Callbacks, BaseCallbackConfig } from "@langchain/core/callbacks/manager";
import { EvalOutputType, LLMEvalChainInput, LLMStringEvaluator, StringEvaluatorArgs, type ExtractLLMCallOptions } from "../base.js";
import { ConstitutionalPrinciple } from "../../chains/constitutional_ai/constitutional_principle.js";
/**
 * A Criteria to evaluate.
 */
export type Criteria = "conciseness" | "relevance" | "correctness" | "coherence" | "harmfulness" | "maliciousness" | "helpfulness" | "controversiality" | "misogyny" | "criminality" | "insensitivity" | "depth" | "creativity" | "detail";
export type CriteriaLike = {
    [key: string]: string;
} | Criteria | ConstitutionalPrinciple;
/**
 * A parser for the output of the CriteriaEvalChain.
 */
export declare class CriteriaResultOutputParser extends BaseLLMOutputParser<EvalOutputType> {
    lc_namespace: string[];
    parseResult(generations: Generation[] | ChatGeneration[], _callbacks: Callbacks | undefined): Promise<EvalOutputType>;
}
export interface CriteriaEvalInput {
    input?: string;
    output: string;
    reference?: string;
}
export declare class CriteriaEvalChain extends LLMStringEvaluator {
    static lc_name(): string;
    criterionName?: string;
    evaluationName?: string;
    requiresInput: boolean;
    requiresReference: boolean;
    skipReferenceWarning: string;
    outputParser: BaseLLMOutputParser<EvalOutputType>;
    /**
     * Resolve the criteria to evaluate.
     * @param criteria The criteria to evaluate the runs against. It can be:
     *                 -  a mapping of a criterion name to its description
     *                 -  a single criterion name present in one of the default criteria
     *                 -  a single `ConstitutionalPrinciple` instance
     *
     * @return A dictionary mapping criterion names to descriptions.
     */
    static resolveCriteria(criteria?: CriteriaLike): Record<string, string>;
    /**
     * Resolve the prompt to use for the evaluation.
     * @param prompt
     */
    static resolvePrompt(prompt?: BasePromptTemplate): BasePromptTemplate<any, import("@langchain/core/prompt_values").BasePromptValueInterface, any>;
    /**
     * Create a new instance of the CriteriaEvalChain.
     * @param llm
     * @param criteria
     * @param chainOptions Options to pass to the constructor of the LLMChain.
     */
    static fromLLM(llm: BaseLanguageModelInterface, criteria?: CriteriaLike, chainOptions?: Partial<Omit<LLMEvalChainInput, "llm">>): Promise<CriteriaEvalChain>;
    getEvalInput({ input, prediction, reference, }: StringEvaluatorArgs): CriteriaEvalInput;
    /**
     * Prepare the output of the evaluation.
     * @param result
     */
    _prepareOutput(result: ChainValues): any;
    _evaluateStrings(args: StringEvaluatorArgs & ExtractLLMCallOptions<this["llm"]>, config?: Callbacks | BaseCallbackConfig): Promise<ChainValues>;
}
/**
 * Criteria evaluation chain that requires references.
 */
export declare class LabeledCriteriaEvalChain extends CriteriaEvalChain {
    static lc_name(): string;
    requiresReference: boolean;
    static resolvePrompt(prompt?: BasePromptTemplate): BasePromptTemplate<any, import("@langchain/core/prompt_values").BasePromptValueInterface, any>;
}
