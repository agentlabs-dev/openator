"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEvaluator = void 0;
const openai_1 = require("@langchain/openai");
const chat_models_1 = require("@langchain/core/language_models/chat_models");
const index_js_1 = require("./criteria/index.cjs");
const index_js_2 = require("./comparison/index.cjs");
const index_js_3 = require("./embedding_distance/index.cjs");
const index_js_4 = require("./agents/index.cjs");
/**
 * Load the requested evaluation chain specified by a string
 * @param type The type of evaluator to load.
 * @param options
 *        - llm The language model to use for the evaluator.
 *        - criteria The criteria to use for the evaluator.
 *        - agentTools A list of tools available to the agent,for TrajectoryEvalChain.
 */
async function loadEvaluator(type, options) {
    const { llm, chainOptions, criteria, agentTools } = options || {};
    const llm_ = llm ??
        new openai_1.ChatOpenAI({
            modelName: "gpt-4",
            temperature: 0.0,
        });
    let evaluator;
    switch (type) {
        case "criteria":
            evaluator = await index_js_1.CriteriaEvalChain.fromLLM(llm_, criteria, chainOptions);
            break;
        case "labeled_criteria":
            evaluator = await index_js_1.LabeledCriteriaEvalChain.fromLLM(llm_, criteria, chainOptions);
            break;
        case "pairwise_string":
            evaluator = await index_js_2.PairwiseStringEvalChain.fromLLM(llm_, criteria, chainOptions);
            break;
        case "labeled_pairwise_string":
            evaluator = await index_js_2.LabeledPairwiseStringEvalChain.fromLLM(llm_, criteria, chainOptions);
            break;
        case "trajectory":
            // eslint-disable-next-line no-instanceof/no-instanceof
            if (!(llm_ instanceof chat_models_1.BaseChatModel)) {
                throw new Error("LLM must be an instance of a base chat model.");
            }
            evaluator = await index_js_4.TrajectoryEvalChain.fromLLM(llm_, agentTools, chainOptions);
            break;
        case "embedding_distance":
            evaluator = new index_js_3.EmbeddingDistanceEvalChain({
                embedding: options?.embedding,
                distanceMetric: options?.distanceMetric,
            });
            break;
        case "pairwise_embedding_distance":
            evaluator = new index_js_3.PairwiseEmbeddingDistanceEvalChain({});
            break;
        default:
            throw new Error(`Unknown type: ${type}`);
    }
    return evaluator;
}
exports.loadEvaluator = loadEvaluator;
