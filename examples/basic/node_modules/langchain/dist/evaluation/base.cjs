"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentTrajectoryEvaluator = exports.LLMPairwiseStringEvaluator = exports.PairwiseStringEvaluator = exports.StringEvaluator = exports.LLMStringEvaluator = exports.EvalChain = exports.LLMEvalChain = exports.eqSet = void 0;
const index_js_1 = require("../chains/index.cjs");
/**
 * Compare two sets for equality
 *
 * @param xs
 * @param ys
 */
const eqSet = (xs, ys) => xs.size === ys.size && [...xs].every((x) => ys.has(x));
exports.eqSet = eqSet;
/**
 * Base llm chain class for evaluators.
 */
class LLMEvalChain extends index_js_1.LLMChain {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "requiresInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "requiresReference", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "skipInputWarning", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `Ignoring input in ${this.constructor.name}, as it is not expected.`
        });
        Object.defineProperty(this, "skipReferenceWarning", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `Ignoring reference in ${this.constructor.name}, as it is not expected.`
        });
    }
    /**
     * Check if the evaluation arguments are valid.
     * @param reference  The reference label.
     * @param input The input string.
     * @throws {Error} If the evaluator requires an input string but none is provided, or if the evaluator requires a reference label but none is provided.
     */
    checkEvaluationArgs(reference, input) {
        if (this.requiresInput && input == null) {
            throw new Error(`${this.constructor.name} requires an input string.`);
        }
        else if (input != null && !this.requiresInput) {
            console.warn(this.skipInputWarning);
        }
        if (this.requiresReference && reference == null) {
            throw new Error(`${this.constructor.name} requires a reference string.`);
        }
        else if (reference != null && !this.requiresReference) {
            console.warn(this.skipReferenceWarning);
        }
    }
}
exports.LLMEvalChain = LLMEvalChain;
/**
 * Base chain class for evaluators.
 */
class EvalChain extends index_js_1.BaseChain {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "requiresInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "requiresReference", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "skipInputWarning", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `Ignoring input in ${this.constructor.name}, as it is not expected.`
        });
        Object.defineProperty(this, "skipReferenceWarning", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: `Ignoring reference in ${this.constructor.name}, as it is not expected.`
        });
    }
    /**
     * Check if the evaluation arguments are valid.
     * @param reference  The reference label.
     * @param input The input string.
     * @throws {Error} If the evaluator requires an input string but none is provided, or if the evaluator requires a reference label but none is provided.
     */
    checkEvaluationArgs(reference, input) {
        if (this.requiresInput && input == null) {
            throw new Error(`${this.constructor.name} requires an input string.`);
        }
        else if (input != null && !this.requiresInput) {
            console.warn(this.skipInputWarning);
        }
        if (this.requiresReference && reference == null) {
            throw new Error(`${this.constructor.name} requires a reference string.`);
        }
        else if (reference != null && !this.requiresReference) {
            console.warn(this.skipReferenceWarning);
        }
    }
}
exports.EvalChain = EvalChain;
/**
 * Grade, tag, or otherwise evaluate predictions relative to their inputs
 * and/or reference labels
 */
class LLMStringEvaluator extends LLMEvalChain {
    constructor() {
        super(...arguments);
        /**
         * The name of the evaluation.
         */
        Object.defineProperty(this, "evaluationName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.constructor.name
        });
    }
    /**
     * Evaluate Chain or LLM output, based on optional input and label.
     * @returns The evaluation results containing the score or value. It is recommended that the dictionary contain the following keys:
     * - score: the score of the evaluation, if applicable.
     * - value: the string value of the evaluation, if applicable.
     * - reasoning: the reasoning for the evaluation, if applicable.
     * @param args
     * @param callOptions
     * @param config
     */
    evaluateStrings(args, config) {
        this.checkEvaluationArgs(args.reference, args.input);
        return this._evaluateStrings(args, config);
    }
}
exports.LLMStringEvaluator = LLMStringEvaluator;
/**
 * Grade, tag, or otherwise evaluate predictions relative to their inputs
 * and/or reference labels
 */
class StringEvaluator extends EvalChain {
    constructor() {
        super(...arguments);
        /**
         * The name of the evaluation.
         */
        Object.defineProperty(this, "evaluationName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.constructor.name
        });
    }
    /**
     * Evaluate Chain or LLM output, based on optional input and label.
     * @returns The evaluation results containing the score or value. It is recommended that the dictionary contain the following keys:
     * - score: the score of the evaluation, if applicable.
     * - value: the string value of the evaluation, if applicable.
     * - reasoning: the reasoning for the evaluation, if applicable.
     * @param args
     * @param config
     */
    evaluateStrings(args, config) {
        this.checkEvaluationArgs(args.reference, args.input);
        return this._evaluateStrings(args, config);
    }
}
exports.StringEvaluator = StringEvaluator;
/**
 * Compare the output of two models (or two outputs of the same model).
 */
class PairwiseStringEvaluator extends EvalChain {
    constructor() {
        super(...arguments);
        /**
         * The name of the evaluation.
         */
        Object.defineProperty(this, "evaluationName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.constructor.name
        });
    }
    /**
     * Evaluate the output string pairs.
     * @param args
     * @param config
     * @return A dictionary containing the preference, scores, and/or other information.
     */
    evaluateStringPairs(args, config) {
        return this._evaluateStringPairs(args, config);
    }
}
exports.PairwiseStringEvaluator = PairwiseStringEvaluator;
/**
 * Compare the output of two models (or two outputs of the same model).
 */
class LLMPairwiseStringEvaluator extends LLMEvalChain {
    constructor() {
        super(...arguments);
        /**
         * The name of the evaluation.
         */
        Object.defineProperty(this, "evaluationName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.constructor.name
        });
    }
    /**
     * Evaluate the output string pairs.
     * @param args
     * @param callOptions
     * @param config
     * @return A dictionary containing the preference, scores, and/or other information.
     */
    evaluateStringPairs(args, callOptions, config) {
        this.checkEvaluationArgs(args.reference, args.input);
        return this._evaluateStringPairs(args, callOptions, config);
    }
}
exports.LLMPairwiseStringEvaluator = LLMPairwiseStringEvaluator;
/**
 * Interface for evaluating agent trajectories.
 */
class AgentTrajectoryEvaluator extends LLMEvalChain {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "requiresInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        /**
         * The name of the evaluation.
         */
        Object.defineProperty(this, "evaluationName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.constructor.name
        });
    }
    /**
     * Evaluate a trajectory.
     * @return The evaluation result.
     * @param args
     * @param callOptions
     * @param config
     */
    evaluateAgentTrajectory(args, callOptions, config) {
        this.checkEvaluationArgs(args.reference, args.input);
        return this._evaluateAgentTrajectory(args, callOptions, config);
    }
}
exports.AgentTrajectoryEvaluator = AgentTrajectoryEvaluator;
