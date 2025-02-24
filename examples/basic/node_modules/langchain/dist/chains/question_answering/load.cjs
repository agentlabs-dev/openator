"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadQARefineChain = exports.loadQAMapReduceChain = exports.loadQAStuffChain = exports.loadQAChain = void 0;
const llm_chain_js_1 = require("../llm_chain.cjs");
const combine_docs_chain_js_1 = require("../combine_docs_chain.cjs");
const stuff_prompts_js_1 = require("./stuff_prompts.cjs");
const map_reduce_prompts_js_1 = require("./map_reduce_prompts.cjs");
const refine_prompts_js_1 = require("./refine_prompts.cjs");
const loadQAChain = (llm, params = { type: "stuff" }) => {
    const { type } = params;
    if (type === "stuff") {
        return loadQAStuffChain(llm, params);
    }
    if (type === "map_reduce") {
        return loadQAMapReduceChain(llm, params);
    }
    if (type === "refine") {
        return loadQARefineChain(llm, params);
    }
    throw new Error(`Invalid _type: ${type}`);
};
exports.loadQAChain = loadQAChain;
/**
 * Loads a StuffQAChain based on the provided parameters. It takes an LLM
 * instance and StuffQAChainParams as parameters.
 * @param llm An instance of BaseLanguageModel.
 * @param params Parameters for creating a StuffQAChain.
 * @returns A StuffQAChain instance.
 */
function loadQAStuffChain(llm, params = {}) {
    const { prompt = stuff_prompts_js_1.QA_PROMPT_SELECTOR.getPrompt(llm), verbose } = params;
    const llmChain = new llm_chain_js_1.LLMChain({ prompt, llm, verbose });
    const chain = new combine_docs_chain_js_1.StuffDocumentsChain({ llmChain, verbose });
    return chain;
}
exports.loadQAStuffChain = loadQAStuffChain;
/**
 * Loads a MapReduceQAChain based on the provided parameters. It takes an
 * LLM instance and MapReduceQAChainParams as parameters.
 * @param llm An instance of BaseLanguageModel.
 * @param params Parameters for creating a MapReduceQAChain.
 * @returns A MapReduceQAChain instance.
 */
function loadQAMapReduceChain(llm, params = {}) {
    const { combineMapPrompt = map_reduce_prompts_js_1.COMBINE_QA_PROMPT_SELECTOR.getPrompt(llm), combinePrompt = map_reduce_prompts_js_1.COMBINE_PROMPT_SELECTOR.getPrompt(llm), verbose, combineLLM, returnIntermediateSteps, } = params;
    const llmChain = new llm_chain_js_1.LLMChain({ prompt: combineMapPrompt, llm, verbose });
    const combineLLMChain = new llm_chain_js_1.LLMChain({
        prompt: combinePrompt,
        llm: combineLLM ?? llm,
        verbose,
    });
    const combineDocumentChain = new combine_docs_chain_js_1.StuffDocumentsChain({
        llmChain: combineLLMChain,
        documentVariableName: "summaries",
        verbose,
    });
    const chain = new combine_docs_chain_js_1.MapReduceDocumentsChain({
        llmChain,
        combineDocumentChain,
        returnIntermediateSteps,
        verbose,
    });
    return chain;
}
exports.loadQAMapReduceChain = loadQAMapReduceChain;
/**
 * Loads a RefineQAChain based on the provided parameters. It takes an LLM
 * instance and RefineQAChainParams as parameters.
 * @param llm An instance of BaseLanguageModel.
 * @param params Parameters for creating a RefineQAChain.
 * @returns A RefineQAChain instance.
 */
function loadQARefineChain(llm, params = {}) {
    const { questionPrompt = refine_prompts_js_1.QUESTION_PROMPT_SELECTOR.getPrompt(llm), refinePrompt = refine_prompts_js_1.REFINE_PROMPT_SELECTOR.getPrompt(llm), refineLLM, verbose, } = params;
    const llmChain = new llm_chain_js_1.LLMChain({ prompt: questionPrompt, llm, verbose });
    const refineLLMChain = new llm_chain_js_1.LLMChain({
        prompt: refinePrompt,
        llm: refineLLM ?? llm,
        verbose,
    });
    const chain = new combine_docs_chain_js_1.RefineDocumentsChain({
        llmChain,
        refineLLMChain,
        verbose,
    });
    return chain;
}
exports.loadQARefineChain = loadQARefineChain;
