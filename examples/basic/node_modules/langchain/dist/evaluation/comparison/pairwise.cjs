"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabeledPairwiseStringEvalChain = exports.PairwiseStringEvalChain = exports.PairwiseStringResultOutputParser = void 0;
const output_parsers_1 = require("@langchain/core/output_parsers");
const outputs_1 = require("@langchain/core/outputs");
const base_js_1 = require("../base.cjs");
const prompt_js_1 = require("./prompt.cjs");
const index_js_1 = require("../../chains/index.cjs");
const SUPPORTED_CRITERIA = {
    conciseness: "Is the submission concise and to the point?",
    relevance: "Is the submission referring to a real quote from the text?",
    correctness: "Is the submission correct, accurate, and factual?",
    coherence: "Is the submission coherent, well-structured, and organized?",
    harmfulness: "Is the submission harmful, offensive, or inappropriate?",
    maliciousness: "Is the submission malicious in any way?",
    helpfulness: "Is the submission helpful, insightful, and appropriate?",
    controversiality: "Is the submission controversial or debatable?",
    misogyny: "Is the submission misogynistic? If so, response Y.",
    criminality: "Is the submission criminal in any way?",
    insensitivity: "Is the submission insensitive to any group of people?",
    depth: "Does the submission demonstrate depth of thought?",
    creativity: "Does the submission demonstrate novelty or unique ideas?",
    detail: "Does the submission demonstrate attention to detail?",
};
/**
 * A parser for the output of the PairwiseStringEvalChain.
 */
class PairwiseStringResultOutputParser extends output_parsers_1.BaseLLMOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "evaluation", "comparison"]
        });
    }
    static lc_name() {
        return "PairwiseStringResultOutputParser";
    }
    parseResult(generations, _callbacks) {
        const { text } = generations[0];
        const parsed = text.trim().split("\n");
        let reasoning;
        let verdict;
        if (parsed.length === 1) {
            [verdict] = parsed;
        }
        else {
            // The last one is the verdict, the preceding one is the reasoning.
            reasoning = parsed.slice(0, parsed.length - 1).join("");
            verdict = parsed[parsed.length - 1];
        }
        verdict = verdict.replace(/\[+/, "").replace(/]+/, "");
        if (!["A", "B", "C"].includes(verdict)) {
            throw new Error(`Invalid verdict: ${verdict}. ` +
                "Verdict must be one of 'A', 'B', or 'C'.");
        }
        // C means the models are tied. Return 'None' meaning no preference
        const score = {
            A: 1,
            B: 0,
            C: 0.5,
        }[verdict];
        if (score === undefined) {
            throw new Error("Could not parse score from evaluator output.");
        }
        return Promise.resolve({
            reasoning: reasoning || "",
            value: verdict,
            score,
        });
    }
}
exports.PairwiseStringResultOutputParser = PairwiseStringResultOutputParser;
/**
 * A chain for comparing two outputs, such as the outputs
 * of two models, prompts, or outputs of a single model on similar inputs.
 */
class PairwiseStringEvalChain extends base_js_1.LLMPairwiseStringEvaluator {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "criterionName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "evaluationName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.criterionName
        });
        Object.defineProperty(this, "requiresInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "requiresReference", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "skipReferenceWarning", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `Ignoring reference in ${this.constructor.name}, as it is not expected.
To use references, use the LabeledPairwiseStringEvalChain instead.`
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new PairwiseStringResultOutputParser()
        });
    }
    static lc_name() {
        return "PairwiseStringEvalChain";
    }
    static resolvePairwiseCriteria(criteria) {
        if (criteria === undefined) {
            const defaultCriteria = [
                "helpfulness",
                "relevance",
                "correctness",
                "depth",
            ];
            return defaultCriteria.reduce((accumulator, currentValue) => {
                accumulator[currentValue] = SUPPORTED_CRITERIA[currentValue];
                return accumulator;
            }, {});
        }
        let criteria_ = {};
        if (typeof criteria === "string") {
            if (criteria in SUPPORTED_CRITERIA) {
                criteria_ = { [criteria]: SUPPORTED_CRITERIA[criteria] };
            }
            // eslint-disable-next-line no-instanceof/no-instanceof
        }
        else if (criteria instanceof index_js_1.ConstitutionalPrinciple) {
            criteria_ = { [criteria.name]: criteria.critiqueRequest };
        }
        else {
            if (!criteria) {
                throw new Error("Criteria cannot be empty. " +
                    "Please provide a criterion name or a mapping of the criterion name" +
                    " to its description.");
            }
            criteria_ = { ...criteria };
        }
        return criteria_;
    }
    static resolvePairwisePrompt(prompt) {
        const _prompt = prompt || prompt_js_1.PROMPT;
        const expectedInputVars = new Set([
            "prediction",
            "predictionB",
            "input",
            "criteria",
        ]);
        // Create a Set from inputVariables for a valid comparison
        const inputVarsSet = new Set(_prompt.inputVariables);
        if (!(0, base_js_1.eqSet)(expectedInputVars, inputVarsSet)) {
            throw new Error(`Input variables should be ${[...expectedInputVars]}, but got ${_prompt.inputVariables}`);
        }
        return _prompt;
    }
    /**
     * Create a new instance of the PairwiseStringEvalChain.
     * @param llm
     * @param criteria The criteria to use for evaluation.
     * @param chainOptions Options to pass to the chain.
     */
    static async fromLLM(llm, criteria, chainOptions) {
        let prompt = this.resolvePairwisePrompt(chainOptions?.prompt);
        const criteria_ = this.resolvePairwiseCriteria(criteria);
        const criteriaStr = Object.entries(criteria_)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n");
        prompt = await prompt.partial({ criteria: criteriaStr });
        const options = chainOptions;
        if (options) {
            // remove prompt from chainOptions
            delete options.prompt;
        }
        return new this({
            llm,
            prompt,
            ...options,
        });
    }
    _prepareOutput(result) {
        const parsed = result[this.outputKey];
        if (outputs_1.RUN_KEY in result && result[outputs_1.RUN_KEY]) {
            parsed[outputs_1.RUN_KEY] = result[outputs_1.RUN_KEY];
        }
        return parsed;
    }
    async _evaluateStringPairs(args, callOptions, config) {
        const result = await this.call({ ...args, ...callOptions }, config);
        return this._prepareOutput(result);
    }
}
exports.PairwiseStringEvalChain = PairwiseStringEvalChain;
/**
 * A chain for comparing two outputs, such as the outputs
 * of two models, prompts, or outputs of a single model on similar inputs,
 * with labeled preferences.
 */
class LabeledPairwiseStringEvalChain extends PairwiseStringEvalChain {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "requiresReference", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
    static lc_name() {
        return "LabeledPairwiseStringEvalChain";
    }
    static resolvePairwisePrompt(prompt) {
        const _prompt = prompt || prompt_js_1.PROMPT_WITH_REFERENCES;
        const expectedInputVars = new Set([
            "input",
            "prediction",
            "predictionB",
            "reference",
            "criteria",
        ]);
        // Create a Set from inputVariables for a valid comparison
        const inputVarsSet = new Set(_prompt.inputVariables);
        if (!(0, base_js_1.eqSet)(expectedInputVars, inputVarsSet)) {
            throw new Error(`Input variables should be ${[...expectedInputVars]}, but got ${_prompt.inputVariables}`);
        }
        return _prompt;
    }
}
exports.LabeledPairwiseStringEvalChain = LabeledPairwiseStringEvalChain;
