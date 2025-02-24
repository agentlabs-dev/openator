"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIChain = void 0;
const base_js_1 = require("../base.cjs");
const llm_chain_js_1 = require("../llm_chain.cjs");
const prompts_js_1 = require("./prompts.cjs");
/**
 * Class that extends BaseChain and represents a chain specifically
 * designed for making API requests and processing API responses.
 */
class APIChain extends base_js_1.BaseChain {
    get inputKeys() {
        return [this.inputKey];
    }
    get outputKeys() {
        return [this.outputKey];
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "apiAnswerChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "apiRequestChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "apiDocs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "headers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "inputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "question"
        });
        Object.defineProperty(this, "outputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "output"
        });
        this.apiRequestChain = fields.apiRequestChain;
        this.apiAnswerChain = fields.apiAnswerChain;
        this.apiDocs = fields.apiDocs;
        this.inputKey = fields.inputKey ?? this.inputKey;
        this.outputKey = fields.outputKey ?? this.outputKey;
        this.headers = fields.headers ?? this.headers;
    }
    /** @ignore */
    async _call(values, runManager) {
        const question = values[this.inputKey];
        const api_url = await this.apiRequestChain.predict({ question, api_docs: this.apiDocs }, runManager?.getChild("request"));
        const res = await fetch(api_url, { headers: this.headers });
        const api_response = await res.text();
        const answer = await this.apiAnswerChain.predict({ question, api_docs: this.apiDocs, api_url, api_response }, runManager?.getChild("response"));
        return { [this.outputKey]: answer };
    }
    _chainType() {
        return "api_chain";
    }
    static async deserialize(data) {
        const { api_request_chain, api_answer_chain, api_docs } = data;
        if (!api_request_chain) {
            throw new Error("LLMChain must have api_request_chain");
        }
        if (!api_answer_chain) {
            throw new Error("LLMChain must have api_answer_chain");
        }
        if (!api_docs) {
            throw new Error("LLMChain must have api_docs");
        }
        return new APIChain({
            apiAnswerChain: await llm_chain_js_1.LLMChain.deserialize(api_answer_chain),
            apiRequestChain: await llm_chain_js_1.LLMChain.deserialize(api_request_chain),
            apiDocs: api_docs,
        });
    }
    serialize() {
        return {
            _type: this._chainType(),
            api_answer_chain: this.apiAnswerChain.serialize(),
            api_request_chain: this.apiRequestChain.serialize(),
            api_docs: this.apiDocs,
        };
    }
    /**
     * Static method to create a new APIChain from a BaseLanguageModel and API
     * documentation.
     * @param llm BaseLanguageModel instance.
     * @param apiDocs API documentation.
     * @param options Optional configuration options for the APIChain.
     * @returns New APIChain instance.
     */
    static fromLLMAndAPIDocs(llm, apiDocs, options = {}) {
        const { apiUrlPrompt = prompts_js_1.API_URL_PROMPT_TEMPLATE, apiResponsePrompt = prompts_js_1.API_RESPONSE_PROMPT_TEMPLATE, } = options;
        const apiRequestChain = new llm_chain_js_1.LLMChain({ prompt: apiUrlPrompt, llm });
        const apiAnswerChain = new llm_chain_js_1.LLMChain({ prompt: apiResponsePrompt, llm });
        return new this({
            apiAnswerChain,
            apiRequestChain,
            apiDocs,
            ...options,
        });
    }
}
exports.APIChain = APIChain;
