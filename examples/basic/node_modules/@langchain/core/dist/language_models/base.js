import { InMemoryCache } from "../caches/base.js";
import { StringPromptValue, ChatPromptValue, } from "../prompt_values.js";
import { coerceMessageLikeToMessage } from "../messages/utils.js";
import { AsyncCaller } from "../utils/async_caller.js";
import { encodingForModel } from "../utils/tiktoken.js";
import { Runnable } from "../runnables/base.js";
// https://www.npmjs.com/package/js-tiktoken
export const getModelNameForTiktoken = (modelName) => {
    if (modelName.startsWith("gpt-3.5-turbo-16k")) {
        return "gpt-3.5-turbo-16k";
    }
    if (modelName.startsWith("gpt-3.5-turbo-")) {
        return "gpt-3.5-turbo";
    }
    if (modelName.startsWith("gpt-4-32k")) {
        return "gpt-4-32k";
    }
    if (modelName.startsWith("gpt-4-")) {
        return "gpt-4";
    }
    if (modelName.startsWith("gpt-4o")) {
        return "gpt-4o";
    }
    return modelName;
};
export const getEmbeddingContextSize = (modelName) => {
    switch (modelName) {
        case "text-embedding-ada-002":
            return 8191;
        default:
            return 2046;
    }
};
export const getModelContextSize = (modelName) => {
    switch (getModelNameForTiktoken(modelName)) {
        case "gpt-3.5-turbo-16k":
            return 16384;
        case "gpt-3.5-turbo":
            return 4096;
        case "gpt-4-32k":
            return 32768;
        case "gpt-4":
            return 8192;
        case "text-davinci-003":
            return 4097;
        case "text-curie-001":
            return 2048;
        case "text-babbage-001":
            return 2048;
        case "text-ada-001":
            return 2048;
        case "code-davinci-002":
            return 8000;
        case "code-cushman-001":
            return 2048;
        default:
            return 4097;
    }
};
/**
 * Whether or not the input matches the OpenAI tool definition.
 * @param {unknown} tool The input to check.
 * @returns {boolean} Whether the input is an OpenAI tool definition.
 */
export function isOpenAITool(tool) {
    if (typeof tool !== "object" || !tool)
        return false;
    if ("type" in tool &&
        tool.type === "function" &&
        "function" in tool &&
        typeof tool.function === "object" &&
        tool.function &&
        "name" in tool.function &&
        "parameters" in tool.function) {
        return true;
    }
    return false;
}
export const calculateMaxTokens = async ({ prompt, modelName, }) => {
    let numTokens;
    try {
        numTokens = (await encodingForModel(getModelNameForTiktoken(modelName))).encode(prompt).length;
    }
    catch (error) {
        console.warn("Failed to calculate number of tokens, falling back to approximate count");
        // fallback to approximate calculation if tiktoken is not available
        // each token is ~4 characters: https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them#
        numTokens = Math.ceil(prompt.length / 4);
    }
    const maxTokens = getModelContextSize(modelName);
    return maxTokens - numTokens;
};
const getVerbosity = () => false;
/**
 * Base class for language models, chains, tools.
 */
export class BaseLangChain extends Runnable {
    get lc_attributes() {
        return {
            callbacks: undefined,
            verbose: undefined,
        };
    }
    constructor(params) {
        super(params);
        /**
         * Whether to print out response text.
         */
        Object.defineProperty(this, "verbose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.verbose = params.verbose ?? getVerbosity();
        this.callbacks = params.callbacks;
        this.tags = params.tags ?? [];
        this.metadata = params.metadata ?? {};
    }
}
/**
 * Base class for language models.
 */
export class BaseLanguageModel extends BaseLangChain {
    /**
     * Keys that the language model accepts as call options.
     */
    get callKeys() {
        return ["stop", "timeout", "signal", "tags", "metadata", "callbacks"];
    }
    constructor({ callbacks, callbackManager, ...params }) {
        const { cache, ...rest } = params;
        super({
            callbacks: callbacks ?? callbackManager,
            ...rest,
        });
        /**
         * The async caller should be used by subclasses to make any async calls,
         * which will thus benefit from the concurrency and retry logic.
         */
        Object.defineProperty(this, "caller", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_encoding", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (typeof cache === "object") {
            this.cache = cache;
        }
        else if (cache) {
            this.cache = InMemoryCache.global();
        }
        else {
            this.cache = undefined;
        }
        this.caller = new AsyncCaller(params ?? {});
    }
    async getNumTokens(content) {
        // TODO: Figure out correct value.
        if (typeof content !== "string") {
            return 0;
        }
        // fallback to approximate calculation if tiktoken is not available
        let numTokens = Math.ceil(content.length / 4);
        if (!this._encoding) {
            try {
                this._encoding = await encodingForModel("modelName" in this
                    ? getModelNameForTiktoken(this.modelName)
                    : "gpt2");
            }
            catch (error) {
                console.warn("Failed to calculate number of tokens, falling back to approximate count", error);
            }
        }
        if (this._encoding) {
            try {
                numTokens = this._encoding.encode(content).length;
            }
            catch (error) {
                console.warn("Failed to calculate number of tokens, falling back to approximate count", error);
            }
        }
        return numTokens;
    }
    static _convertInputToPromptValue(input) {
        if (typeof input === "string") {
            return new StringPromptValue(input);
        }
        else if (Array.isArray(input)) {
            return new ChatPromptValue(input.map(coerceMessageLikeToMessage));
        }
        else {
            return input;
        }
    }
    /**
     * Get the identifying parameters of the LLM.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _identifyingParams() {
        return {};
    }
    /**
     * Create a unique cache key for a specific call to a specific language model.
     * @param callOptions Call options for the model
     * @returns A unique cache key.
     */
    _getSerializedCacheKeyParametersForCall(
    // TODO: Fix when we remove the RunnableLambda backwards compatibility shim.
    { config, ...callOptions }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params = {
            ...this._identifyingParams(),
            ...callOptions,
            _type: this._llmType(),
            _model: this._modelType(),
        };
        const filteredEntries = Object.entries(params).filter(([_, value]) => value !== undefined);
        const serializedEntries = filteredEntries
            .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
            .sort()
            .join(",");
        return serializedEntries;
    }
    /**
     * @deprecated
     * Return a json-like object representing this LLM.
     */
    serialize() {
        return {
            ...this._identifyingParams(),
            _type: this._llmType(),
            _model: this._modelType(),
        };
    }
    /**
     * @deprecated
     * Load an LLM from a json-like object describing it.
     */
    static async deserialize(_data) {
        throw new Error("Use .toJSON() instead");
    }
}
