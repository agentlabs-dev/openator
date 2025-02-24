import type { TiktokenModel } from "js-tiktoken/lite";
import { z } from "zod";
import { type BaseCache } from "../caches/base.js";
import { type BasePromptValueInterface } from "../prompt_values.js";
import { type BaseMessage, type BaseMessageLike, type MessageContent } from "../messages/base.js";
import { type LLMResult } from "../outputs.js";
import { CallbackManager, Callbacks } from "../callbacks/manager.js";
import { AsyncCaller, AsyncCallerParams } from "../utils/async_caller.js";
import { Runnable, type RunnableInterface } from "../runnables/base.js";
import { RunnableConfig } from "../runnables/config.js";
export declare const getModelNameForTiktoken: (modelName: string) => TiktokenModel;
export declare const getEmbeddingContextSize: (modelName?: string) => number;
export declare const getModelContextSize: (modelName: string) => number;
/**
 * Whether or not the input matches the OpenAI tool definition.
 * @param {unknown} tool The input to check.
 * @returns {boolean} Whether the input is an OpenAI tool definition.
 */
export declare function isOpenAITool(tool: unknown): tool is ToolDefinition;
interface CalculateMaxTokenProps {
    prompt: string;
    modelName: TiktokenModel;
}
export declare const calculateMaxTokens: ({ prompt, modelName, }: CalculateMaxTokenProps) => Promise<number>;
export type SerializedLLM = {
    _model: string;
    _type: string;
} & Record<string, any>;
export interface BaseLangChainParams {
    verbose?: boolean;
    callbacks?: Callbacks;
    tags?: string[];
    metadata?: Record<string, unknown>;
}
/**
 * Base class for language models, chains, tools.
 */
export declare abstract class BaseLangChain<RunInput, RunOutput, CallOptions extends RunnableConfig = RunnableConfig> extends Runnable<RunInput, RunOutput, CallOptions> implements BaseLangChainParams {
    /**
     * Whether to print out response text.
     */
    verbose: boolean;
    callbacks?: Callbacks;
    tags?: string[];
    metadata?: Record<string, unknown>;
    get lc_attributes(): {
        [key: string]: undefined;
    } | undefined;
    constructor(params: BaseLangChainParams);
}
/**
 * Base interface for language model parameters.
 * A subclass of {@link BaseLanguageModel} should have a constructor that
 * takes in a parameter that extends this interface.
 */
export interface BaseLanguageModelParams extends AsyncCallerParams, BaseLangChainParams {
    /**
     * @deprecated Use `callbacks` instead
     */
    callbackManager?: CallbackManager;
    cache?: BaseCache | boolean;
}
export interface BaseLanguageModelCallOptions extends RunnableConfig {
    /**
     * Stop tokens to use for this call.
     * If not provided, the default stop tokens for the model will be used.
     */
    stop?: string[];
}
export interface FunctionDefinition {
    /**
     * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain
     * underscores and dashes, with a maximum length of 64.
     */
    name: string;
    /**
     * The parameters the functions accepts, described as a JSON Schema object. See the
     * [guide](https://platform.openai.com/docs/guides/gpt/function-calling) for
     * examples, and the
     * [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for
     * documentation about the format.
     *
     * To describe a function that accepts no parameters, provide the value
     * `{"type": "object", "properties": {}}`.
     */
    parameters: Record<string, unknown>;
    /**
     * A description of what the function does, used by the model to choose when and
     * how to call the function.
     */
    description?: string;
}
export interface ToolDefinition {
    type: "function";
    function: FunctionDefinition;
}
export type FunctionCallOption = {
    name: string;
};
export interface BaseFunctionCallOptions extends BaseLanguageModelCallOptions {
    function_call?: FunctionCallOption;
    functions?: FunctionDefinition[];
}
export type BaseLanguageModelInput = BasePromptValueInterface | string | BaseMessageLike[];
export type StructuredOutputType = z.infer<z.ZodObject<any, any, any, any>>;
export type StructuredOutputMethodOptions<IncludeRaw extends boolean = false> = {
    name?: string;
    method?: "functionCalling" | "jsonMode" | "jsonSchema" | string;
    includeRaw?: IncludeRaw;
    /** Whether to use strict mode. Currently only supported by OpenAI models. */
    strict?: boolean;
};
/** @deprecated Use StructuredOutputMethodOptions instead */
export type StructuredOutputMethodParams<RunOutput, IncludeRaw extends boolean = false> = {
    /** @deprecated Pass schema in as the first argument */
    schema: z.ZodType<RunOutput> | Record<string, any>;
    name?: string;
    method?: "functionCalling" | "jsonMode";
    includeRaw?: IncludeRaw;
};
export interface BaseLanguageModelInterface<RunOutput = any, CallOptions extends BaseLanguageModelCallOptions = BaseLanguageModelCallOptions> extends RunnableInterface<BaseLanguageModelInput, RunOutput, CallOptions> {
    get callKeys(): string[];
    generatePrompt(promptValues: BasePromptValueInterface[], options?: string[] | CallOptions, callbacks?: Callbacks): Promise<LLMResult>;
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.2.0.
     */
    predict(text: string, options?: string[] | CallOptions, callbacks?: Callbacks): Promise<string>;
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.2.0.
     */
    predictMessages(messages: BaseMessage[], options?: string[] | CallOptions, callbacks?: Callbacks): Promise<BaseMessage>;
    _modelType(): string;
    _llmType(): string;
    getNumTokens(content: MessageContent): Promise<number>;
    /**
     * Get the identifying parameters of the LLM.
     */
    _identifyingParams(): Record<string, any>;
    serialize(): SerializedLLM;
}
export type LanguageModelOutput = BaseMessage | string;
export type LanguageModelLike = Runnable<BaseLanguageModelInput, LanguageModelOutput>;
/**
 * Base class for language models.
 */
export declare abstract class BaseLanguageModel<RunOutput = any, CallOptions extends BaseLanguageModelCallOptions = BaseLanguageModelCallOptions> extends BaseLangChain<BaseLanguageModelInput, RunOutput, CallOptions> implements BaseLanguageModelParams, BaseLanguageModelInterface<RunOutput, CallOptions> {
    /**
     * Keys that the language model accepts as call options.
     */
    get callKeys(): string[];
    /**
     * The async caller should be used by subclasses to make any async calls,
     * which will thus benefit from the concurrency and retry logic.
     */
    caller: AsyncCaller;
    cache?: BaseCache;
    constructor({ callbacks, callbackManager, ...params }: BaseLanguageModelParams);
    abstract generatePrompt(promptValues: BasePromptValueInterface[], options?: string[] | CallOptions, callbacks?: Callbacks): Promise<LLMResult>;
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.2.0.
     */
    abstract predict(text: string, options?: string[] | CallOptions, callbacks?: Callbacks): Promise<string>;
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.2.0.
     */
    abstract predictMessages(messages: BaseMessage[], options?: string[] | CallOptions, callbacks?: Callbacks): Promise<BaseMessage>;
    abstract _modelType(): string;
    abstract _llmType(): string;
    private _encoding?;
    getNumTokens(content: MessageContent): Promise<number>;
    protected static _convertInputToPromptValue(input: BaseLanguageModelInput): BasePromptValueInterface;
    /**
     * Get the identifying parameters of the LLM.
     */
    _identifyingParams(): Record<string, any>;
    /**
     * Create a unique cache key for a specific call to a specific language model.
     * @param callOptions Call options for the model
     * @returns A unique cache key.
     */
    _getSerializedCacheKeyParametersForCall({ config, ...callOptions }: CallOptions & {
        config?: RunnableConfig;
    }): string;
    /**
     * @deprecated
     * Return a json-like object representing this LLM.
     */
    serialize(): SerializedLLM;
    /**
     * @deprecated
     * Load an LLM from a json-like object describing it.
     */
    static deserialize(_data: SerializedLLM): Promise<BaseLanguageModel>;
    withStructuredOutput?<RunOutput extends Record<string, any> = Record<string, any>>(schema: z.ZodType<RunOutput> | Record<string, any>, config?: StructuredOutputMethodOptions<false>): Runnable<BaseLanguageModelInput, RunOutput>;
    withStructuredOutput?<RunOutput extends Record<string, any> = Record<string, any>>(schema: z.ZodType<RunOutput> | Record<string, any>, config?: StructuredOutputMethodOptions<true>): Runnable<BaseLanguageModelInput, {
        raw: BaseMessage;
        parsed: RunOutput;
    }>;
    /**
     * Model wrapper that returns outputs formatted to match the given schema.
     *
     * @template {BaseLanguageModelInput} RunInput The input type for the Runnable, expected to be the same input for the LLM.
     * @template {Record<string, any>} RunOutput The output type for the Runnable, expected to be a Zod schema object for structured output validation.
     *
     * @param {z.ZodEffects<RunOutput>} schema The schema for the structured output. Either as a Zod schema or a valid JSON schema object.
     *   If a Zod schema is passed, the returned attributes will be validated, whereas with JSON schema they will not be.
     * @param {string} name The name of the function to call.
     * @param {"functionCalling" | "jsonMode"} [method=functionCalling] The method to use for getting the structured output. Defaults to "functionCalling".
     * @param {boolean | undefined} [includeRaw=false] Whether to include the raw output in the result. Defaults to false.
     * @returns {Runnable<RunInput, RunOutput> | Runnable<RunInput, { raw: BaseMessage; parsed: RunOutput }>} A new runnable that calls the LLM with structured output.
     */
    withStructuredOutput?<RunOutput extends Record<string, any> = Record<string, any>>(schema: z.ZodType<RunOutput> | Record<string, any>, config?: StructuredOutputMethodOptions<boolean>): Runnable<BaseLanguageModelInput, RunOutput> | Runnable<BaseLanguageModelInput, {
        raw: BaseMessage;
        parsed: RunOutput;
    }>;
}
/**
 * Shared interface for token usage
 * return type from LLM calls.
 */
export interface TokenUsage {
    completionTokens?: number;
    promptTokens?: number;
    totalTokens?: number;
}
export {};
