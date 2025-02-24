import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { ChainValues } from "@langchain/core/utils/types";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain, LLMChainInput } from "../../chains/llm_chain.js";
export interface EvaluateArgs {
    questionKey: string;
    answerKey: string;
    predictionKey: string;
}
export declare class QAEvalChain extends LLMChain {
    static lc_name(): string;
    static fromLlm(llm: BaseLanguageModelInterface, options?: {
        prompt?: PromptTemplate;
        chainInput?: Omit<LLMChainInput, "llm">;
    }): QAEvalChain;
    evaluate(examples: ChainValues, predictions: ChainValues, args?: EvaluateArgs): Promise<ChainValues>;
}
