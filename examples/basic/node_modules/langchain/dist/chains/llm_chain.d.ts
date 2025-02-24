import { BaseLanguageModel, BaseLanguageModelInterface, BaseLanguageModelInput } from "@langchain/core/language_models/base";
import type { ChainValues } from "@langchain/core/utils/types";
import type { Generation } from "@langchain/core/outputs";
import type { BaseMessage } from "@langchain/core/messages";
import type { BasePromptValueInterface } from "@langchain/core/prompt_values";
import { BasePromptTemplate } from "@langchain/core/prompts";
import { BaseLLMOutputParser } from "@langchain/core/output_parsers";
import { CallbackManager, BaseCallbackConfig, CallbackManagerForChainRun, Callbacks } from "@langchain/core/callbacks/manager";
import { Runnable } from "@langchain/core/runnables";
import { BaseChain, ChainInputs } from "./base.js";
import { SerializedLLMChain } from "./serde.js";
type LLMType = BaseLanguageModelInterface | Runnable<BaseLanguageModelInput, string> | Runnable<BaseLanguageModelInput, BaseMessage>;
type CallOptionsIfAvailable<T> = T extends {
    CallOptions: infer CO;
} ? CO : any;
/**
 * Interface for the input parameters of the LLMChain class.
 */
export interface LLMChainInput<T extends string | object = string, Model extends LLMType = LLMType> extends ChainInputs {
    /** Prompt object to use */
    prompt: BasePromptTemplate;
    /** LLM Wrapper to use */
    llm: Model;
    /** Kwargs to pass to LLM */
    llmKwargs?: CallOptionsIfAvailable<Model>;
    /** OutputParser to use */
    outputParser?: BaseLLMOutputParser<T>;
    /** Key to use for output, defaults to `text` */
    outputKey?: string;
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
export declare class LLMChain<T extends string | object = string, Model extends LLMType = LLMType> extends BaseChain implements LLMChainInput<T> {
    static lc_name(): string;
    lc_serializable: boolean;
    prompt: BasePromptTemplate;
    llm: Model;
    llmKwargs?: CallOptionsIfAvailable<Model>;
    outputKey: string;
    outputParser?: BaseLLMOutputParser<T>;
    get inputKeys(): string[];
    get outputKeys(): string[];
    constructor(fields: LLMChainInput<T, Model>);
    private getCallKeys;
    /** @ignore */
    _selectMemoryInputs(values: ChainValues): ChainValues;
    /** @ignore */
    _getFinalOutput(generations: Generation[], promptValue: BasePromptValueInterface, runManager?: CallbackManagerForChainRun): Promise<unknown>;
    /**
     * Run the core logic of this chain and add to output if desired.
     *
     * Wraps _call and handles memory.
     */
    call(values: ChainValues & CallOptionsIfAvailable<Model>, config?: Callbacks | BaseCallbackConfig): Promise<ChainValues>;
    /** @ignore */
    _call(values: ChainValues & CallOptionsIfAvailable<Model>, runManager?: CallbackManagerForChainRun): Promise<ChainValues>;
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
    predict(values: ChainValues & CallOptionsIfAvailable<Model>, callbackManager?: CallbackManager): Promise<T>;
    _chainType(): "llm";
    static deserialize(data: SerializedLLMChain): Promise<LLMChain<string, BaseLanguageModel<any, import("@langchain/core/language_models/base").BaseLanguageModelCallOptions>>>;
    /** @deprecated */
    serialize(): SerializedLLMChain;
    _getNumTokens(text: string): Promise<number>;
}
export {};
