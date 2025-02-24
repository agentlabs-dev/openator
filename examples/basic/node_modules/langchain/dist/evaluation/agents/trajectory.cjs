"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrajectoryEvalChain = exports.TrajectoryOutputParser = void 0;
const output_parsers_1 = require("@langchain/core/output_parsers");
const outputs_1 = require("@langchain/core/outputs");
const base_js_1 = require("../base.cjs");
const prompt_js_1 = require("./prompt.cjs");
/**
 * A parser for the output of the TrajectoryEvalChain.
 */
class TrajectoryOutputParser extends output_parsers_1.BaseLLMOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "evaluation", "agents"]
        });
    }
    static lc_name() {
        return "TrajectoryOutputParser";
    }
    parseResult(generations, _callbacks) {
        const { text } = generations[0];
        if (!text.includes("Score:")) {
            throw new Error(`Could not find score in model eval output: ${text}`);
        }
        let [reasoning, scoreStr] = text.split("Score:", 2);
        reasoning = reasoning.trim();
        scoreStr = scoreStr.trim();
        // Use regex to extract the score.
        // This will get the number in the string, even if it is a float or more than 10.
        // E.g. "Score: 1" will return 1, "Score: 3.5" will return 3.5, and
        // "Score: 10" will return 10.
        // The score should be an integer digit in the range 1-5.
        const scoreMatch = scoreStr.match(/(\d+(\.\d+)?)/);
        if (scoreMatch === null || scoreMatch[1].includes(".")) {
            throw new Error(`Score is not an integer digit in the range 1-5: ${text}`);
        }
        const score = +scoreMatch[1];
        if (score < 1 || score > 5) {
            throw new Error(`Score is not a digit in the range 1-5: ${text}`);
        }
        const normalizedScore = (score - 1) / 4;
        return Promise.resolve({
            reasoning,
            score: normalizedScore,
        });
    }
}
exports.TrajectoryOutputParser = TrajectoryOutputParser;
/**
 * A chain for evaluating ReAct style agents.
 *
 * This chain is used to evaluate ReAct style agents by reasoning about
 * the sequence of actions taken and their outcomes.
 */
class TrajectoryEvalChain extends base_js_1.AgentTrajectoryEvaluator {
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
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new TrajectoryOutputParser()
        });
    }
    static lc_name() {
        return "TrajectoryEvalChain";
    }
    static resolveTrajectoryPrompt(prompt, agentTools) {
        let _prompt;
        if (prompt) {
            _prompt = prompt;
        }
        else if (agentTools) {
            _prompt = prompt_js_1.EVAL_CHAT_PROMPT;
        }
        else {
            _prompt = prompt_js_1.TOOL_FREE_EVAL_CHAT_PROMPT;
        }
        return _prompt;
    }
    /**
     * Get the description of the agent tools.
     *
     * @returns The description of the agent tools.
     */
    static toolsDescription(agentTools) {
        return agentTools
            .map((tool, i) => `Tool ${i + 1}: ${tool.name}\n Description: ${tool.description}`)
            .join("\n\n");
    }
    /**
     * Create a new TrajectoryEvalChain.
     * @param llm
     * @param agentTools - The tools used by the agent.
     * @param chainOptions - The options for the chain.
     */
    static async fromLLM(llm, agentTools, chainOptions) {
        let prompt = this.resolveTrajectoryPrompt(chainOptions?.prompt, agentTools);
        if (agentTools) {
            const toolDescriptions = this.toolsDescription(agentTools);
            prompt = await prompt.partial({ toolDescriptions });
        }
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
    /**
     * Get the agent trajectory as a formatted string.
     *
     * @param steps - The agent trajectory.
     * @returns The formatted agent trajectory.
     */
    getAgentTrajectory(steps) {
        return steps
            .map((step, i) => {
            const { action, observation } = step;
            return (`Step ${i + 1}:\n` +
                `Tool used: ${action.tool}\n` +
                `Tool input: ${action.toolInput}\n` +
                `Tool output: ${observation}`);
        })
            .join("\n\n");
    }
    formatReference(reference) {
        if (!reference) {
            return "";
        }
        return `
The following is the expected answer. Use this to measure correctness:
[GROUND_TRUTH]
${reference}
[END_GROUND_TRUTH]
        `;
    }
    async _evaluateAgentTrajectory(args, callOptions, config) {
        const { input, prediction, reference, agentTrajectory } = args;
        const inputs = {
            question: input,
            agentTrajectory: this.getAgentTrajectory(agentTrajectory),
            answer: prediction,
            reference: this.formatReference(reference),
        };
        const result = await this.call({ ...inputs, ...callOptions }, config);
        return this._prepareOutput(result);
    }
}
exports.TrajectoryEvalChain = TrajectoryEvalChain;
