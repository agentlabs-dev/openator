"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMRouterChain = void 0;
const llm_chain_js_1 = require("../../chains/llm_chain.cjs");
const multi_route_js_1 = require("./multi_route.cjs");
/**
 * A class that represents an LLM router chain in the LangChain framework.
 * It extends the RouterChain class and implements the LLMRouterChainInput
 * interface. It provides additional functionality specific to LLMs and
 * routing based on LLM predictions.
 */
class LLMRouterChain extends multi_route_js_1.RouterChain {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "llmChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.llmChain = fields.llmChain;
    }
    get inputKeys() {
        return this.llmChain.inputKeys;
    }
    async _call(values, runManager) {
        return this.llmChain.predict(values, runManager?.getChild());
    }
    _chainType() {
        return "llm_router_chain";
    }
    /**
     * A static method that creates an instance of LLMRouterChain from a
     * BaseLanguageModel and a BasePromptTemplate. It takes in an optional
     * options object and returns an instance of LLMRouterChain with the
     * specified LLMChain.
     * @param llm A BaseLanguageModel instance.
     * @param prompt A BasePromptTemplate instance.
     * @param options Optional LLMRouterChainInput object, excluding "llmChain".
     * @returns An instance of LLMRouterChain.
     */
    static fromLLM(llm, prompt, options) {
        const llmChain = new llm_chain_js_1.LLMChain({ llm, prompt });
        return new LLMRouterChain({ ...options, llmChain });
    }
}
exports.LLMRouterChain = LLMRouterChain;
