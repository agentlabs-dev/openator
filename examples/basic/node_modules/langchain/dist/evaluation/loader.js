import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { CriteriaEvalChain, LabeledCriteriaEvalChain, } from "./criteria/index.js";
import { LabeledPairwiseStringEvalChain, PairwiseStringEvalChain, } from "./comparison/index.js";
import { EmbeddingDistanceEvalChain, PairwiseEmbeddingDistanceEvalChain, } from "./embedding_distance/index.js";
import { TrajectoryEvalChain } from "./agents/index.js";
/**
 * Load the requested evaluation chain specified by a string
 * @param type The type of evaluator to load.
 * @param options
 *        - llm The language model to use for the evaluator.
 *        - criteria The criteria to use for the evaluator.
 *        - agentTools A list of tools available to the agent,for TrajectoryEvalChain.
 */
export async function loadEvaluator(type, options) {
    const { llm, chainOptions, criteria, agentTools } = options || {};
    const llm_ = llm ??
        new ChatOpenAI({
            modelName: "gpt-4",
            temperature: 0.0,
        });
    let evaluator;
    switch (type) {
        case "criteria":
            evaluator = await CriteriaEvalChain.fromLLM(llm_, criteria, chainOptions);
            break;
        case "labeled_criteria":
            evaluator = await LabeledCriteriaEvalChain.fromLLM(llm_, criteria, chainOptions);
            break;
        case "pairwise_string":
            evaluator = await PairwiseStringEvalChain.fromLLM(llm_, criteria, chainOptions);
            break;
        case "labeled_pairwise_string":
            evaluator = await LabeledPairwiseStringEvalChain.fromLLM(llm_, criteria, chainOptions);
            break;
        case "trajectory":
            // eslint-disable-next-line no-instanceof/no-instanceof
            if (!(llm_ instanceof BaseChatModel)) {
                throw new Error("LLM must be an instance of a base chat model.");
            }
            evaluator = await TrajectoryEvalChain.fromLLM(llm_, agentTools, chainOptions);
            break;
        case "embedding_distance":
            evaluator = new EmbeddingDistanceEvalChain({
                embedding: options?.embedding,
                distanceMetric: options?.distanceMetric,
            });
            break;
        case "pairwise_embedding_distance":
            evaluator = new PairwiseEmbeddingDistanceEvalChain({});
            break;
        default:
            throw new Error(`Unknown type: ${type}`);
    }
    return evaluator;
}
