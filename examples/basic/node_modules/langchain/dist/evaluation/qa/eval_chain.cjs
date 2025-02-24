"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QAEvalChain = void 0;
const prompt_js_1 = require("./prompt.cjs");
const llm_chain_js_1 = require("../../chains/llm_chain.cjs");
const eqSet = (xs, ys) => xs.size === ys.size && [...xs].every((x) => ys.has(x));
class QAEvalChain extends llm_chain_js_1.LLMChain {
    static lc_name() {
        return "QAEvalChain";
    }
    static fromLlm(llm, options = {}) {
        const prompt = options.prompt || prompt_js_1.QA_PROMPT;
        const expectedInputVars = new Set([
            "query",
            "answer",
            "result",
        ]);
        // Create a Set from inputVariables for a valid comparison
        const inputVarsSet = new Set(prompt.inputVariables);
        if (!eqSet(expectedInputVars, inputVarsSet)) {
            throw new Error(`Input variables should be ${[...expectedInputVars]}, but got ${prompt.inputVariables}`);
        }
        return new this({ llm, prompt, ...options.chainInput });
    }
    async evaluate(examples, predictions, args = {
        questionKey: "query",
        answerKey: "answer",
        predictionKey: "result",
    }) {
        const inputs = examples.map((example, i) => ({
            query: example[args.questionKey],
            answer: example[args.answerKey],
            result: predictions[i][args.predictionKey],
        }));
        return await this.apply(inputs);
    }
}
exports.QAEvalChain = QAEvalChain;
