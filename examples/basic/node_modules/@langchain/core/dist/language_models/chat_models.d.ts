import { z } from "zod";
import { type BaseMessage, BaseMessageChunk, type BaseMessageLike, AIMessageChunk } from "../messages/index.js";
import type { BasePromptValueInterface } from "../prompt_values.js";
import { LLMResult, ChatGenerationChunk, type ChatResult, type Generation } from "../outputs.js";
import { BaseLanguageModel, type StructuredOutputMethodOptions, type ToolDefinition, type BaseLanguageModelCallOptions, type BaseLanguageModelInput, type BaseLanguageModelParams } from "./base.js";
import { type CallbackManagerForLLMRun, type Callbacks } from "../callbacks/manager.js";
import type { RunnableConfig } from "../runnables/config.js";
import type { BaseCache } from "../caches/base.js";
import { StructuredToolInterface, StructuredToolParams } from "../tools/index.js";
import { Runnable, RunnableToolLike } from "../runnables/base.js";
export type ToolChoice = string | Record<string, any> | "auto" | "any";
/**
 * Represents a serialized chat model.
 */
export type SerializedChatModel = {
    _model: string;
    _type: string;
} & Record<string, any>;
/**
 * Represents a serialized large language model.
 */
export type SerializedLLM = {
    _model: string;
    _type: string;
} & Record<string, any>;
/**
 * Represents the parameters for a base chat model.
 */
export type BaseChatModelParams = BaseLanguageModelParams & {
    /**
     * Whether to disable streaming.
     *
     * If streaming is bypassed, then `stream()` will defer to
     * `invoke()`.
     *
     * - If true, will always bypass streaming case.
     * - If false (default), will always use streaming case if available.
     */
    disableStreaming?: boolean;
};
/**
 * Represents the call options for a base chat model.
 */
export type BaseChatModelCallOptions = BaseLanguageModelCallOptions & {
    /**
     * Specifies how the chat model should use tools.
     * @default undefined
     *
     * Possible values:
     * - "auto": The model may choose to use any of the provided tools, or none.
     * - "any": The model must use one of the provided tools.
     * - "none": The model must not use any tools.
     * - A string (not "auto", "any", or "none"): The name of a specific tool the model must use.
     * - An object: A custom schema specifying tool choice parameters. Specific to the provider.
     *
     * Note: Not all providers support tool_choice. An error will be thrown
     * if used with an unsupported model.
     */
    tool_choice?: ToolChoice;
};
/**
 * Creates a transform stream for encoding chat message chunks.
 * @deprecated Use {@link BytesOutputParser} instead
 * @returns A TransformStream instance that encodes chat message chunks.
 */
export declare function createChatMessageChunkEncoderStream(): TransformStream<BaseMessageChunk, any>;
export type LangSmithParams = {
    ls_provider?: string;
    ls_model_name?: string;
    ls_model_type: "chat";
    ls_temperature?: number;
    ls_max_tokens?: number;
    ls_stop?: Array<string>;
};
export type BindToolsInput = StructuredToolInterface | Record<string, any> | ToolDefinition | RunnableToolLike | StructuredToolParams;
/**
 * Base class for chat models. It extends the BaseLanguageModel class and
 * provides methods for generating chat based on input messages.
 */
export declare abstract class BaseChatModel<CallOptions extends BaseChatModelCallOptions = BaseChatModelCallOptions, OutputMessageType extends BaseMessageChunk = AIMessageChunk> extends BaseLanguageModel<OutputMessageType, CallOptions> {
    ParsedCallOptions: Omit<CallOptions, Exclude<keyof RunnableConfig, "signal" | "timeout" | "maxConcurrency">>;
    lc_namespace: string[];
    disableStreaming: boolean;
    constructor(fields: BaseChatModelParams);
    _combineLLMOutput?(...llmOutputs: LLMResult["llmOutput"][]): LLMResult["llmOutput"];
    protected _separateRunnableConfigFromCallOptionsCompat(options?: Partial<CallOptions>): [RunnableConfig, this["ParsedCallOptions"]];
    /**
     * Bind tool-like objects to this chat model.
     *
     * @param tools A list of tool definitions to bind to this chat model.
     * Can be a structured tool, an OpenAI formatted tool, or an object
     * matching the provider's specific tool schema.
     * @param kwargs Any additional parameters to bind.
     */
    bindTools?(tools: BindToolsInput[], kwargs?: Partial<CallOptions>): Runnable<BaseLanguageModelInput, OutputMessageType, CallOptions>;
    /**
     * Invokes the chat model with a single input.
     * @param input The input for the language model.
     * @param options The call options.
     * @returns A Promise that resolves to a BaseMessageChunk.
     */
    invoke(input: BaseLanguageModelInput, options?: CallOptions): Promise<OutputMessageType>;
    _streamResponseChunks(_messages: BaseMessage[], _options: this["ParsedCallOptions"], _runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
    _streamIterator(input: BaseLanguageModelInput, options?: CallOptions): AsyncGenerator<OutputMessageType>;
    getLsParams(options: this["ParsedCallOptions"]): LangSmithParams;
    /** @ignore */
    _generateUncached(messages: BaseMessageLike[][], parsedOptions: this["ParsedCallOptions"], handledOptions: RunnableConfig, startedRunManagers?: CallbackManagerForLLMRun[]): Promise<LLMResult>;
    _generateCached({ messages, cache, llmStringKey, parsedOptions, handledOptions, }: {
        messages: BaseMessageLike[][];
        cache: BaseCache<Generation[]>;
        llmStringKey: string;
        parsedOptions: any;
        handledOptions: RunnableConfig;
    }): Promise<LLMResult & {
        missingPromptIndices: number[];
        startedRunManagers?: CallbackManagerForLLMRun[];
    }>;
    /**
     * Generates chat based on the input messages.
     * @param messages An array of arrays of BaseMessage instances.
     * @param options The call options or an array of stop sequences.
     * @param callbacks The callbacks for the language model.
     * @returns A Promise that resolves to an LLMResult.
     */
    generate(messages: BaseMessageLike[][], options?: string[] | CallOptions, callbacks?: Callbacks): Promise<LLMResult>;
    /**
     * Get the parameters used to invoke the model
     */
    invocationParams(_options?: this["ParsedCallOptions"]): any;
    _modelType(): string;
    abstract _llmType(): string;
    /**
     * @deprecated
     * Return a json-like object representing this LLM.
     */
    serialize(): SerializedLLM;
    /**
     * Generates a prompt based on the input prompt values.
     * @param promptValues An array of BasePromptValue instances.
     * @param options The call options or an array of stop sequences.
     * @param callbacks The callbacks for the language model.
     * @returns A Promise that resolves to an LLMResult.
     */
    generatePrompt(promptValues: BasePromptValueInterface[], options?: string[] | CallOptions, callbacks?: Callbacks): Promise<LLMResult>;
    abstract _generate(messages: BaseMessage[], options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): Promise<ChatResult>;
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.2.0.
     *
     * Makes a single call to the chat model.
     * @param messages An array of BaseMessage instances.
     * @param options The call options or an array of stop sequences.
     * @param callbacks The callbacks for the language model.
     * @returns A Promise that resolves to a BaseMessage.
     */
    call(messages: BaseMessageLike[], options?: string[] | CallOptions, callbacks?: Callbacks): Promise<BaseMessage>;
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.2.0.
     *
     * Makes a single call to the chat model with a prompt value.
     * @param promptValue The value of the prompt.
     * @param options The call options or an array of stop sequences.
     * @param callbacks The callbacks for the language model.
     * @returns A Promise that resolves to a BaseMessage.
     */
    callPrompt(promptValue: BasePromptValueInterface, options?: string[] | CallOptions, callbacks?: Callbacks): Promise<BaseMessage>;
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.2.0.
     *
     * Predicts the next message based on the input messages.
     * @param messages An array of BaseMessage instances.
     * @param options The call options or an array of stop sequences.
     * @param callbacks The callbacks for the language model.
     * @returns A Promise that resolves to a BaseMessage.
     */
    predictMessages(messages: BaseMessage[], options?: string[] | CallOptions, callbacks?: Callbacks): Promise<BaseMessage>;
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.2.0.
     *
     * Predicts the next message based on a text input.
     * @param text The text input.
     * @param options The call options or an array of stop sequences.
     * @param callbacks The callbacks for the language model.
     * @returns A Promise that resolves to a string.
     */
    predict(text: string, options?: string[] | CallOptions, callbacks?: Callbacks): Promise<string>;
    withStructuredOutput<RunOutput extends Record<string, any> = Record<string, any>>(outputSchema: z.ZodType<RunOutput> | Record<string, any>, config?: StructuredOutputMethodOptions<false>): Runnable<BaseLanguageModelInput, RunOutput>;
    withStructuredOutput<RunOutput extends Record<string, any> = Record<string, any>>(outputSchema: z.ZodType<RunOutput> | Record<string, any>, config?: StructuredOutputMethodOptions<true>): Runnable<BaseLanguageModelInput, {
        raw: BaseMessage;
        parsed: RunOutput;
    }>;
}
/**
 * An abstract class that extends BaseChatModel and provides a simple
 * implementation of _generate.
 */
export declare abstract class SimpleChatModel<CallOptions extends BaseChatModelCallOptions = BaseChatModelCallOptions> extends BaseChatModel<CallOptions> {
    abstract _call(messages: BaseMessage[], options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): Promise<string>;
    _generate(messages: BaseMessage[], options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): Promise<ChatResult>;
}
