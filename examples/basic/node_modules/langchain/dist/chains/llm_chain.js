import { BaseLanguageModel, } from "@langchain/core/language_models/base";
import { BasePromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { BaseChain } from "./base.js";
import { NoOpOutputParser } from "../output_parsers/noop.js";
function isBaseLanguageModel(llmLike) {
    return typeof llmLike._llmType === "function";
}
function _getLanguageModel(llmLike) {
    if (isBaseLanguageModel(llmLike)) {
        return llmLike;
    }
    else if ("bound" in llmLike && Runnable.isRunnable(llmLike.bound)) {
        return _getLanguageModel(llmLike.bound);
    }
    else if ("runnable" in llmLike &&
        "fallbacks" in llmLike &&
        Runnable.isRunnable(llmLike.runnable)) {
        return _getLanguageModel(llmLike.runnable);
    }
    else if ("default" in llmLike && Runnable.isRunnable(llmLike.default)) {
        return _getLanguageModel(llmLike.default);
    }
    else {
        throw new Error("Unable to extract BaseLanguageModel from llmLike object.");
    }
}
/**
 * @deprecated This class will be removed in 1.0.0. Use the LangChain Expression Language (LCEL) instead.
 * See the example below for how to use LCEL with the LLMChain class:
 *
 * Chain to run queries against LLMs.
 *
 * @example
 * ```ts
 * import { ChatPromptTemplate } from "@langchain/core/prompts";
 * import { ChatOpenAI } from "@langchain/openai";
 *
 * const prompt = ChatPromptTemplate.fromTemplate("Tell me a {adjective} joke");
 * const llm = new ChatOpenAI();
 * const chain = prompt.pipe(llm);
 *
 * const response = await chain.invoke({ adjective: "funny" });
 * ```
 */
export class LLMChain extends BaseChain {
    static lc_name() {
        return "LLMChain";
    }
    get inputKeys() {
        return this.prompt.inputVariables;
    }
    get outputKeys() {
        return [this.outputKey];
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "prompt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "llm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "llmKwargs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "text"
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.prompt = fields.prompt;
        this.llm = fields.llm;
        this.llmKwargs = fields.llmKwargs;
        this.outputKey = fields.outputKey ?? this.outputKey;
        this.outputParser =
            fields.outputParser ?? new NoOpOutputParser();
        if (this.prompt.outputParser) {
            if (fields.outputParser) {
                throw new Error("Cannot set both outputParser and prompt.outputParser");
            }
            this.outputParser = this.prompt.outputParser;
        }
    }
    getCallKeys() {
        const callKeys = "callKeys" in this.llm ? this.llm.callKeys : [];
        return callKeys;
    }
    /** @ignore */
    _selectMemoryInputs(values) {
        const valuesForMemory = super._selectMemoryInputs(values);
        const callKeys = this.getCallKeys();
        for (const key of callKeys) {
            if (key in values) {
                delete valuesForMemory[key];
            }
        }
        return valuesForMemory;
    }
    /** @ignore */
    async _getFinalOutput(generations, promptValue, runManager) {
        let finalCompletion;
        if (this.outputParser) {
            finalCompletion = await this.outputParser.parseResultWithPrompt(generations, promptValue, runManager?.getChild());
        }
        else {
            finalCompletion = generations[0].text;
        }
        return finalCompletion;
    }
    /**
     * Run the core logic of this chain and add to output if desired.
     *
     * Wraps _call and handles memory.
     */
    call(values, config) {
        return super.call(values, config);
    }
    /** @ignore */
    async _call(values, runManager) {
        const valuesForPrompt = { ...values };
        const valuesForLLM = {
            ...this.llmKwargs,
        };
        const callKeys = this.getCallKeys();
        for (const key of callKeys) {
            if (key in values) {
                if (valuesForLLM) {
                    valuesForLLM[key] =
                        values[key];
                    delete valuesForPrompt[key];
                }
            }
        }
        const promptValue = await this.prompt.formatPromptValue(valuesForPrompt);
        if ("generatePrompt" in this.llm) {
            const { generations } = await this.llm.generatePrompt([promptValue], valuesForLLM, runManager?.getChild());
            return {
                [this.outputKey]: await this._getFinalOutput(generations[0], promptValue, runManager),
            };
        }
        const modelWithParser = this.outputParser
            ? this.llm.pipe(this.outputParser)
            : this.llm;
        const response = await modelWithParser.invoke(promptValue, runManager?.getChild());
        return {
            [this.outputKey]: response,
        };
    }
    /**
     * Format prompt with values and pass to LLM
     *
     * @param values - keys to pass to prompt template
     * @param callbackManager - CallbackManager to use
     * @returns Completion from LLM.
     *
     * @example
     * ```ts
     * llm.predict({ adjective: "funny" })
     * ```
     */
    async predict(values, callbackManager) {
        const output = await this.call(values, callbackManager);
        return output[this.outputKey];
    }
    _chainType() {
        return "llm";
    }
    static async deserialize(data) {
        const { llm, prompt } = data;
        if (!llm) {
            throw new Error("LLMChain must have llm");
        }
        if (!prompt) {
            throw new Error("LLMChain must have prompt");
        }
        return new LLMChain({
            llm: await BaseLanguageModel.deserialize(llm),
            prompt: await BasePromptTemplate.deserialize(prompt),
        });
    }
    /** @deprecated */
    serialize() {
        const serialize = "serialize" in this.llm ? this.llm.serialize() : undefined;
        return {
            _type: `${this._chainType()}_chain`,
            llm: serialize,
            prompt: this.prompt.serialize(),
        };
    }
    _getNumTokens(text) {
        return _getLanguageModel(this.llm).getNumTokens(text);
    }
}
