import { zodToJsonSchema } from "zod-to-json-schema";
import { AIMessage, HumanMessage, coerceMessageLikeToMessage, isAIMessageChunk, isBaseMessage, isAIMessage, } from "../messages/index.js";
import { RUN_KEY, } from "../outputs.js";
import { BaseLanguageModel, } from "./base.js";
import { CallbackManager, } from "../callbacks/manager.js";
import { RunnableLambda, RunnableSequence, } from "../runnables/base.js";
import { concat } from "../utils/stream.js";
import { RunnablePassthrough } from "../runnables/passthrough.js";
import { isZodSchema } from "../utils/types/is_zod_schema.js";
import { callbackHandlerPrefersStreaming } from "../callbacks/base.js";
/**
 * Creates a transform stream for encoding chat message chunks.
 * @deprecated Use {@link BytesOutputParser} instead
 * @returns A TransformStream instance that encodes chat message chunks.
 */
export function createChatMessageChunkEncoderStream() {
    const textEncoder = new TextEncoder();
    return new TransformStream({
        transform(chunk, controller) {
            controller.enqueue(textEncoder.encode(typeof chunk.content === "string"
                ? chunk.content
                : JSON.stringify(chunk.content)));
        },
    });
}
/**
 * Base class for chat models. It extends the BaseLanguageModel class and
 * provides methods for generating chat based on input messages.
 */
export class BaseChatModel extends BaseLanguageModel {
    constructor(fields) {
        super(fields);
        // Only ever instantiated in main LangChain
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "chat_models", this._llmType()]
        });
        Object.defineProperty(this, "disableStreaming", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    _separateRunnableConfigFromCallOptionsCompat(options) {
        // For backwards compat, keep `signal` in both runnableConfig and callOptions
        const [runnableConfig, callOptions] = super._separateRunnableConfigFromCallOptions(options);
        callOptions.signal = runnableConfig.signal;
        return [runnableConfig, callOptions];
    }
    /**
     * Invokes the chat model with a single input.
     * @param input The input for the language model.
     * @param options The call options.
     * @returns A Promise that resolves to a BaseMessageChunk.
     */
    async invoke(input, options) {
        const promptValue = BaseChatModel._convertInputToPromptValue(input);
        const result = await this.generatePrompt([promptValue], options, options?.callbacks);
        const chatGeneration = result.generations[0][0];
        // TODO: Remove cast after figuring out inheritance
        return chatGeneration.message;
    }
    // eslint-disable-next-line require-yield
    async *_streamResponseChunks(_messages, _options, _runManager) {
        throw new Error("Not implemented.");
    }
    async *_streamIterator(input, options) {
        // Subclass check required to avoid double callbacks with default implementation
        if (this._streamResponseChunks ===
            BaseChatModel.prototype._streamResponseChunks ||
            this.disableStreaming) {
            yield this.invoke(input, options);
        }
        else {
            const prompt = BaseChatModel._convertInputToPromptValue(input);
            const messages = prompt.toChatMessages();
            const [runnableConfig, callOptions] = this._separateRunnableConfigFromCallOptionsCompat(options);
            const inheritableMetadata = {
                ...runnableConfig.metadata,
                ...this.getLsParams(callOptions),
            };
            const callbackManager_ = await CallbackManager.configure(runnableConfig.callbacks, this.callbacks, runnableConfig.tags, this.tags, inheritableMetadata, this.metadata, { verbose: this.verbose });
            const extra = {
                options: callOptions,
                invocation_params: this?.invocationParams(callOptions),
                batch_size: 1,
            };
            const runManagers = await callbackManager_?.handleChatModelStart(this.toJSON(), [messages], runnableConfig.runId, undefined, extra, undefined, undefined, runnableConfig.runName);
            let generationChunk;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let llmOutput;
            try {
                for await (const chunk of this._streamResponseChunks(messages, callOptions, runManagers?.[0])) {
                    if (chunk.message.id == null) {
                        const runId = runManagers?.at(0)?.runId;
                        if (runId != null)
                            chunk.message._updateId(`run-${runId}`);
                    }
                    chunk.message.response_metadata = {
                        ...chunk.generationInfo,
                        ...chunk.message.response_metadata,
                    };
                    yield chunk.message;
                    if (!generationChunk) {
                        generationChunk = chunk;
                    }
                    else {
                        generationChunk = generationChunk.concat(chunk);
                    }
                    if (isAIMessageChunk(chunk.message) &&
                        chunk.message.usage_metadata !== undefined) {
                        llmOutput = {
                            tokenUsage: {
                                promptTokens: chunk.message.usage_metadata.input_tokens,
                                completionTokens: chunk.message.usage_metadata.output_tokens,
                                totalTokens: chunk.message.usage_metadata.total_tokens,
                            },
                        };
                    }
                }
            }
            catch (err) {
                await Promise.all((runManagers ?? []).map((runManager) => runManager?.handleLLMError(err)));
                throw err;
            }
            await Promise.all((runManagers ?? []).map((runManager) => runManager?.handleLLMEnd({
                // TODO: Remove cast after figuring out inheritance
                generations: [[generationChunk]],
                llmOutput,
            })));
        }
    }
    getLsParams(options) {
        const providerName = this.getName().startsWith("Chat")
            ? this.getName().replace("Chat", "")
            : this.getName();
        return {
            ls_model_type: "chat",
            ls_stop: options.stop,
            ls_provider: providerName,
        };
    }
    /** @ignore */
    async _generateUncached(messages, parsedOptions, handledOptions, startedRunManagers) {
        const baseMessages = messages.map((messageList) => messageList.map(coerceMessageLikeToMessage));
        let runManagers;
        if (startedRunManagers !== undefined &&
            startedRunManagers.length === baseMessages.length) {
            runManagers = startedRunManagers;
        }
        else {
            const inheritableMetadata = {
                ...handledOptions.metadata,
                ...this.getLsParams(parsedOptions),
            };
            // create callback manager and start run
            const callbackManager_ = await CallbackManager.configure(handledOptions.callbacks, this.callbacks, handledOptions.tags, this.tags, inheritableMetadata, this.metadata, { verbose: this.verbose });
            const extra = {
                options: parsedOptions,
                invocation_params: this?.invocationParams(parsedOptions),
                batch_size: 1,
            };
            runManagers = await callbackManager_?.handleChatModelStart(this.toJSON(), baseMessages, handledOptions.runId, undefined, extra, undefined, undefined, handledOptions.runName);
        }
        const generations = [];
        const llmOutputs = [];
        // Even if stream is not explicitly called, check if model is implicitly
        // called from streamEvents() or streamLog() to get all streamed events.
        // Bail out if _streamResponseChunks not overridden
        const hasStreamingHandler = !!runManagers?.[0].handlers.find(callbackHandlerPrefersStreaming);
        if (hasStreamingHandler &&
            !this.disableStreaming &&
            baseMessages.length === 1 &&
            this._streamResponseChunks !==
                BaseChatModel.prototype._streamResponseChunks) {
            try {
                const stream = await this._streamResponseChunks(baseMessages[0], parsedOptions, runManagers?.[0]);
                let aggregated;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let llmOutput;
                for await (const chunk of stream) {
                    if (chunk.message.id == null) {
                        const runId = runManagers?.at(0)?.runId;
                        if (runId != null)
                            chunk.message._updateId(`run-${runId}`);
                    }
                    if (aggregated === undefined) {
                        aggregated = chunk;
                    }
                    else {
                        aggregated = concat(aggregated, chunk);
                    }
                    if (isAIMessageChunk(chunk.message) &&
                        chunk.message.usage_metadata !== undefined) {
                        llmOutput = {
                            tokenUsage: {
                                promptTokens: chunk.message.usage_metadata.input_tokens,
                                completionTokens: chunk.message.usage_metadata.output_tokens,
                                totalTokens: chunk.message.usage_metadata.total_tokens,
                            },
                        };
                    }
                }
                if (aggregated === undefined) {
                    throw new Error("Received empty response from chat model call.");
                }
                generations.push([aggregated]);
                await runManagers?.[0].handleLLMEnd({
                    generations,
                    llmOutput,
                });
            }
            catch (e) {
                await runManagers?.[0].handleLLMError(e);
                throw e;
            }
        }
        else {
            // generate results
            const results = await Promise.allSettled(baseMessages.map((messageList, i) => this._generate(messageList, { ...parsedOptions, promptIndex: i }, runManagers?.[i])));
            // handle results
            await Promise.all(results.map(async (pResult, i) => {
                if (pResult.status === "fulfilled") {
                    const result = pResult.value;
                    for (const generation of result.generations) {
                        if (generation.message.id == null) {
                            const runId = runManagers?.at(0)?.runId;
                            if (runId != null)
                                generation.message._updateId(`run-${runId}`);
                        }
                        generation.message.response_metadata = {
                            ...generation.generationInfo,
                            ...generation.message.response_metadata,
                        };
                    }
                    if (result.generations.length === 1) {
                        result.generations[0].message.response_metadata = {
                            ...result.llmOutput,
                            ...result.generations[0].message.response_metadata,
                        };
                    }
                    generations[i] = result.generations;
                    llmOutputs[i] = result.llmOutput;
                    return runManagers?.[i]?.handleLLMEnd({
                        generations: [result.generations],
                        llmOutput: result.llmOutput,
                    });
                }
                else {
                    // status === "rejected"
                    await runManagers?.[i]?.handleLLMError(pResult.reason);
                    return Promise.reject(pResult.reason);
                }
            }));
        }
        // create combined output
        const output = {
            generations,
            llmOutput: llmOutputs.length
                ? this._combineLLMOutput?.(...llmOutputs)
                : undefined,
        };
        Object.defineProperty(output, RUN_KEY, {
            value: runManagers
                ? { runIds: runManagers?.map((manager) => manager.runId) }
                : undefined,
            configurable: true,
        });
        return output;
    }
    async _generateCached({ messages, cache, llmStringKey, parsedOptions, handledOptions, }) {
        const baseMessages = messages.map((messageList) => messageList.map(coerceMessageLikeToMessage));
        const inheritableMetadata = {
            ...handledOptions.metadata,
            ...this.getLsParams(parsedOptions),
        };
        // create callback manager and start run
        const callbackManager_ = await CallbackManager.configure(handledOptions.callbacks, this.callbacks, handledOptions.tags, this.tags, inheritableMetadata, this.metadata, { verbose: this.verbose });
        const extra = {
            options: parsedOptions,
            invocation_params: this?.invocationParams(parsedOptions),
            batch_size: 1,
        };
        const runManagers = await callbackManager_?.handleChatModelStart(this.toJSON(), baseMessages, handledOptions.runId, undefined, extra, undefined, undefined, handledOptions.runName);
        // generate results
        const missingPromptIndices = [];
        const results = await Promise.allSettled(baseMessages.map(async (baseMessage, index) => {
            // Join all content into one string for the prompt index
            const prompt = BaseChatModel._convertInputToPromptValue(baseMessage).toString();
            const result = await cache.lookup(prompt, llmStringKey);
            if (result == null) {
                missingPromptIndices.push(index);
            }
            return result;
        }));
        // Map run managers to the results before filtering out null results
        // Null results are just absent from the cache.
        const cachedResults = results
            .map((result, index) => ({ result, runManager: runManagers?.[index] }))
            .filter(({ result }) => (result.status === "fulfilled" && result.value != null) ||
            result.status === "rejected");
        // Handle results and call run managers
        const generations = [];
        await Promise.all(cachedResults.map(async ({ result: promiseResult, runManager }, i) => {
            if (promiseResult.status === "fulfilled") {
                const result = promiseResult.value;
                generations[i] = result.map((result) => {
                    if ("message" in result &&
                        isBaseMessage(result.message) &&
                        isAIMessage(result.message)) {
                        // eslint-disable-next-line no-param-reassign
                        result.message.usage_metadata = {
                            input_tokens: 0,
                            output_tokens: 0,
                            total_tokens: 0,
                        };
                    }
                    // eslint-disable-next-line no-param-reassign
                    result.generationInfo = {
                        ...result.generationInfo,
                        tokenUsage: {},
                    };
                    return result;
                });
                if (result.length) {
                    await runManager?.handleLLMNewToken(result[0].text);
                }
                return runManager?.handleLLMEnd({
                    generations: [result],
                }, undefined, undefined, undefined, {
                    cached: true,
                });
            }
            else {
                // status === "rejected"
                await runManager?.handleLLMError(promiseResult.reason, undefined, undefined, undefined, {
                    cached: true,
                });
                return Promise.reject(promiseResult.reason);
            }
        }));
        const output = {
            generations,
            missingPromptIndices,
            startedRunManagers: runManagers,
        };
        // This defines RUN_KEY as a non-enumerable property on the output object
        // so that it is not serialized when the output is stringified, and so that
        // it isnt included when listing the keys of the output object.
        Object.defineProperty(output, RUN_KEY, {
            value: runManagers
                ? { runIds: runManagers?.map((manager) => manager.runId) }
                : undefined,
            configurable: true,
        });
        return output;
    }
    /**
     * Generates chat based on the input messages.
     * @param messages An array of arrays of BaseMessage instances.
     * @param options The call options or an array of stop sequences.
     * @param callbacks The callbacks for the language model.
     * @returns A Promise that resolves to an LLMResult.
     */
    async generate(messages, options, callbacks) {
        // parse call options
        let parsedOptions;
        if (Array.isArray(options)) {
            parsedOptions = { stop: options };
        }
        else {
            parsedOptions = options;
        }
        const baseMessages = messages.map((messageList) => messageList.map(coerceMessageLikeToMessage));
        const [runnableConfig, callOptions] = this._separateRunnableConfigFromCallOptionsCompat(parsedOptions);
        runnableConfig.callbacks = runnableConfig.callbacks ?? callbacks;
        if (!this.cache) {
            return this._generateUncached(baseMessages, callOptions, runnableConfig);
        }
        const { cache } = this;
        const llmStringKey = this._getSerializedCacheKeyParametersForCall(callOptions);
        const { generations, missingPromptIndices, startedRunManagers } = await this._generateCached({
            messages: baseMessages,
            cache,
            llmStringKey,
            parsedOptions: callOptions,
            handledOptions: runnableConfig,
        });
        let llmOutput = {};
        if (missingPromptIndices.length > 0) {
            const results = await this._generateUncached(missingPromptIndices.map((i) => baseMessages[i]), callOptions, runnableConfig, startedRunManagers !== undefined
                ? missingPromptIndices.map((i) => startedRunManagers?.[i])
                : undefined);
            await Promise.all(results.generations.map(async (generation, index) => {
                const promptIndex = missingPromptIndices[index];
                generations[promptIndex] = generation;
                // Join all content into one string for the prompt index
                const prompt = BaseChatModel._convertInputToPromptValue(baseMessages[promptIndex]).toString();
                return cache.update(prompt, llmStringKey, generation);
            }));
            llmOutput = results.llmOutput ?? {};
        }
        return { generations, llmOutput };
    }
    /**
     * Get the parameters used to invoke the model
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invocationParams(_options) {
        return {};
    }
    _modelType() {
        return "base_chat_model";
    }
    /**
     * @deprecated
     * Return a json-like object representing this LLM.
     */
    serialize() {
        return {
            ...this.invocationParams(),
            _type: this._llmType(),
            _model: this._modelType(),
        };
    }
    /**
     * Generates a prompt based on the input prompt values.
     * @param promptValues An array of BasePromptValue instances.
     * @param options The call options or an array of stop sequences.
     * @param callbacks The callbacks for the language model.
     * @returns A Promise that resolves to an LLMResult.
     */
    async generatePrompt(promptValues, options, callbacks) {
        const promptMessages = promptValues.map((promptValue) => promptValue.toChatMessages());
        return this.generate(promptMessages, options, callbacks);
    }
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.2.0.
     *
     * Makes a single call to the chat model.
     * @param messages An array of BaseMessage instances.
     * @param options The call options or an array of stop sequences.
     * @param callbacks The callbacks for the language model.
     * @returns A Promise that resolves to a BaseMessage.
     */
    async call(messages, options, callbacks) {
        const result = await this.generate([messages.map(coerceMessageLikeToMessage)], options, callbacks);
        const generations = result.generations;
        return generations[0][0].message;
    }
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.2.0.
     *
     * Makes a single call to the chat model with a prompt value.
     * @param promptValue The value of the prompt.
     * @param options The call options or an array of stop sequences.
     * @param callbacks The callbacks for the language model.
     * @returns A Promise that resolves to a BaseMessage.
     */
    async callPrompt(promptValue, options, callbacks) {
        const promptMessages = promptValue.toChatMessages();
        return this.call(promptMessages, options, callbacks);
    }
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.2.0.
     *
     * Predicts the next message based on the input messages.
     * @param messages An array of BaseMessage instances.
     * @param options The call options or an array of stop sequences.
     * @param callbacks The callbacks for the language model.
     * @returns A Promise that resolves to a BaseMessage.
     */
    async predictMessages(messages, options, callbacks) {
        return this.call(messages, options, callbacks);
    }
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.2.0.
     *
     * Predicts the next message based on a text input.
     * @param text The text input.
     * @param options The call options or an array of stop sequences.
     * @param callbacks The callbacks for the language model.
     * @returns A Promise that resolves to a string.
     */
    async predict(text, options, callbacks) {
        const message = new HumanMessage(text);
        const result = await this.call([message], options, callbacks);
        if (typeof result.content !== "string") {
            throw new Error("Cannot use predict when output is not a string.");
        }
        return result.content;
    }
    withStructuredOutput(outputSchema, config) {
        if (typeof this.bindTools !== "function") {
            throw new Error(`Chat model must implement ".bindTools()" to use withStructuredOutput.`);
        }
        if (config?.strict) {
            throw new Error(`"strict" mode is not supported for this model by default.`);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const schema = outputSchema;
        const name = config?.name;
        const description = schema.description ?? "A function available to call.";
        const method = config?.method;
        const includeRaw = config?.includeRaw;
        if (method === "jsonMode") {
            throw new Error(`Base withStructuredOutput implementation only supports "functionCalling" as a method.`);
        }
        let functionName = name ?? "extract";
        let tools;
        if (isZodSchema(schema)) {
            tools = [
                {
                    type: "function",
                    function: {
                        name: functionName,
                        description,
                        parameters: zodToJsonSchema(schema),
                    },
                },
            ];
        }
        else {
            if ("name" in schema) {
                functionName = schema.name;
            }
            tools = [
                {
                    type: "function",
                    function: {
                        name: functionName,
                        description,
                        parameters: schema,
                    },
                },
            ];
        }
        const llm = this.bindTools(tools);
        const outputParser = RunnableLambda.from((input) => {
            if (!input.tool_calls || input.tool_calls.length === 0) {
                throw new Error("No tool calls found in the response.");
            }
            const toolCall = input.tool_calls.find((tc) => tc.name === functionName);
            if (!toolCall) {
                throw new Error(`No tool call found with name ${functionName}.`);
            }
            return toolCall.args;
        });
        if (!includeRaw) {
            return llm.pipe(outputParser).withConfig({
                runName: "StructuredOutput",
            });
        }
        const parserAssign = RunnablePassthrough.assign({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parsed: (input, config) => outputParser.invoke(input.raw, config),
        });
        const parserNone = RunnablePassthrough.assign({
            parsed: () => null,
        });
        const parsedWithFallback = parserAssign.withFallbacks({
            fallbacks: [parserNone],
        });
        return RunnableSequence.from([
            {
                raw: llm,
            },
            parsedWithFallback,
        ]).withConfig({
            runName: "StructuredOutputRunnable",
        });
    }
}
/**
 * An abstract class that extends BaseChatModel and provides a simple
 * implementation of _generate.
 */
export class SimpleChatModel extends BaseChatModel {
    async _generate(messages, options, runManager) {
        const text = await this._call(messages, options, runManager);
        const message = new AIMessage(text);
        if (typeof message.content !== "string") {
            throw new Error("Cannot generate with a simple chat model when output is not a string.");
        }
        return {
            generations: [
                {
                    text: message.content,
                    message,
                },
            ],
        };
    }
}
