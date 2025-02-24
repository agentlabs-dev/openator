import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { CriteriaLike } from "./criteria/index.js";
import type { EvaluatorType } from "./types.js";
import { LLMEvalChainInput } from "./base.js";
import { EmbeddingDistanceEvalChainInput } from "./embedding_distance/index.js";
export type LoadEvaluatorOptions = EmbeddingDistanceEvalChainInput & {
    llm?: BaseLanguageModelInterface;
    chainOptions?: Partial<Omit<LLMEvalChainInput, "llm">>;
    /**
     * The criteria to use for the evaluator.
     */
    criteria?: CriteriaLike;
    /**
     * A list of tools available to the agent, for TrajectoryEvalChain.
     */
    agentTools?: StructuredToolInterface[];
};
/**
 * Load the requested evaluation chain specified by a string
 * @param type The type of evaluator to load.
 * @param options
 *        - llm The language model to use for the evaluator.
 *        - criteria The criteria to use for the evaluator.
 *        - agentTools A list of tools available to the agent,for TrajectoryEvalChain.
 */
export declare function loadEvaluator<T extends keyof EvaluatorType>(type: T, options?: LoadEvaluatorOptions): Promise<EvaluatorType[T]>;
