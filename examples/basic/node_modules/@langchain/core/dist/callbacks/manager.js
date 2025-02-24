import { v4 as uuidv4 } from "uuid";
import { BaseCallbackHandler, isBaseCallbackHandler, } from "./base.js";
import { ConsoleCallbackHandler } from "../tracers/console.js";
import { getBufferString } from "../messages/utils.js";
import { getEnvironmentVariable } from "../utils/env.js";
import { LangChainTracer, } from "../tracers/tracer_langchain.js";
import { consumeCallback } from "./promises.js";
import { isTracingEnabled } from "../utils/callbacks.js";
import { isBaseTracer } from "../tracers/base.js";
import { getContextVariable, _getConfigureHooks, } from "../singletons/async_local_storage/context.js";
export function parseCallbackConfigArg(arg) {
    if (!arg) {
        return {};
    }
    else if (Array.isArray(arg) || "name" in arg) {
        return { callbacks: arg };
    }
    else {
        return arg;
    }
}
/**
 * Manage callbacks from different components of LangChain.
 */
export class BaseCallbackManager {
    setHandler(handler) {
        return this.setHandlers([handler]);
    }
}
/**
 * Base class for run manager in LangChain.
 */
export class BaseRunManager {
    constructor(runId, handlers, inheritableHandlers, tags, inheritableTags, metadata, inheritableMetadata, _parentRunId) {
        Object.defineProperty(this, "runId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: runId
        });
        Object.defineProperty(this, "handlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: handlers
        });
        Object.defineProperty(this, "inheritableHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: inheritableHandlers
        });
        Object.defineProperty(this, "tags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: tags
        });
        Object.defineProperty(this, "inheritableTags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: inheritableTags
        });
        Object.defineProperty(this, "metadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: metadata
        });
        Object.defineProperty(this, "inheritableMetadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: inheritableMetadata
        });
        Object.defineProperty(this, "_parentRunId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _parentRunId
        });
    }
    get parentRunId() {
        return this._parentRunId;
    }
    async handleText(text) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            try {
                await handler.handleText?.(text, this.runId, this._parentRunId, this.tags);
            }
            catch (err) {
                const logFunction = handler.raiseError
                    ? console.error
                    : console.warn;
                logFunction(`Error in handler ${handler.constructor.name}, handleText: ${err}`);
                if (handler.raiseError) {
                    throw err;
                }
            }
        }, handler.awaitHandlers)));
    }
    async handleCustomEvent(eventName, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data, _runId, _tags, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _metadata) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            try {
                await handler.handleCustomEvent?.(eventName, data, this.runId, this.tags, this.metadata);
            }
            catch (err) {
                const logFunction = handler.raiseError
                    ? console.error
                    : console.warn;
                logFunction(`Error in handler ${handler.constructor.name}, handleCustomEvent: ${err}`);
                if (handler.raiseError) {
                    throw err;
                }
            }
        }, handler.awaitHandlers)));
    }
}
/**
 * Manages callbacks for retriever runs.
 */
export class CallbackManagerForRetrieverRun extends BaseRunManager {
    getChild(tag) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) {
            manager.addTags([tag], false);
        }
        return manager;
    }
    async handleRetrieverEnd(documents) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            if (!handler.ignoreRetriever) {
                try {
                    await handler.handleRetrieverEnd?.(documents, this.runId, this._parentRunId, this.tags);
                }
                catch (err) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleRetriever`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }
        }, handler.awaitHandlers)));
    }
    async handleRetrieverError(err) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            if (!handler.ignoreRetriever) {
                try {
                    await handler.handleRetrieverError?.(err, this.runId, this._parentRunId, this.tags);
                }
                catch (error) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleRetrieverError: ${error}`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }
        }, handler.awaitHandlers)));
    }
}
export class CallbackManagerForLLMRun extends BaseRunManager {
    async handleLLMNewToken(token, idx, _runId, _parentRunId, _tags, fields) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            if (!handler.ignoreLLM) {
                try {
                    await handler.handleLLMNewToken?.(token, idx ?? { prompt: 0, completion: 0 }, this.runId, this._parentRunId, this.tags, fields);
                }
                catch (err) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleLLMNewToken: ${err}`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }
        }, handler.awaitHandlers)));
    }
    async handleLLMError(err, _runId, _parentRunId, _tags, extraParams) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            if (!handler.ignoreLLM) {
                try {
                    await handler.handleLLMError?.(err, this.runId, this._parentRunId, this.tags, extraParams);
                }
                catch (err) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleLLMError: ${err}`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }
        }, handler.awaitHandlers)));
    }
    async handleLLMEnd(output, _runId, _parentRunId, _tags, extraParams) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            if (!handler.ignoreLLM) {
                try {
                    await handler.handleLLMEnd?.(output, this.runId, this._parentRunId, this.tags, extraParams);
                }
                catch (err) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleLLMEnd: ${err}`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }
        }, handler.awaitHandlers)));
    }
}
export class CallbackManagerForChainRun extends BaseRunManager {
    getChild(tag) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) {
            manager.addTags([tag], false);
        }
        return manager;
    }
    async handleChainError(err, _runId, _parentRunId, _tags, kwargs) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            if (!handler.ignoreChain) {
                try {
                    await handler.handleChainError?.(err, this.runId, this._parentRunId, this.tags, kwargs);
                }
                catch (err) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleChainError: ${err}`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }
        }, handler.awaitHandlers)));
    }
    async handleChainEnd(output, _runId, _parentRunId, _tags, kwargs) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            if (!handler.ignoreChain) {
                try {
                    await handler.handleChainEnd?.(output, this.runId, this._parentRunId, this.tags, kwargs);
                }
                catch (err) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleChainEnd: ${err}`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }
        }, handler.awaitHandlers)));
    }
    async handleAgentAction(action) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            if (!handler.ignoreAgent) {
                try {
                    await handler.handleAgentAction?.(action, this.runId, this._parentRunId, this.tags);
                }
                catch (err) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleAgentAction: ${err}`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }
        }, handler.awaitHandlers)));
    }
    async handleAgentEnd(action) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            if (!handler.ignoreAgent) {
                try {
                    await handler.handleAgentEnd?.(action, this.runId, this._parentRunId, this.tags);
                }
                catch (err) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleAgentEnd: ${err}`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }
        }, handler.awaitHandlers)));
    }
}
export class CallbackManagerForToolRun extends BaseRunManager {
    getChild(tag) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) {
            manager.addTags([tag], false);
        }
        return manager;
    }
    async handleToolError(err) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            if (!handler.ignoreAgent) {
                try {
                    await handler.handleToolError?.(err, this.runId, this._parentRunId, this.tags);
                }
                catch (err) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleToolError: ${err}`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }
        }, handler.awaitHandlers)));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handleToolEnd(output) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            if (!handler.ignoreAgent) {
                try {
                    await handler.handleToolEnd?.(output, this.runId, this._parentRunId, this.tags);
                }
                catch (err) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleToolEnd: ${err}`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }
        }, handler.awaitHandlers)));
    }
}
/**
 * @example
 * ```typescript
 * const prompt = PromptTemplate.fromTemplate("What is the answer to {question}?");
 *
 * // Example of using LLMChain with OpenAI and a simple prompt
 * const chain = new LLMChain({
 *   llm: new ChatOpenAI({ temperature: 0.9 }),
 *   prompt,
 * });
 *
 * // Running the chain with a single question
 * const result = await chain.call({
 *   question: "What is the airspeed velocity of an unladen swallow?",
 * });
 * console.log("The answer is:", result);
 * ```
 */
export class CallbackManager extends BaseCallbackManager {
    constructor(parentRunId, options) {
        super();
        Object.defineProperty(this, "handlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "inheritableHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "tags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "inheritableTags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "metadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "inheritableMetadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "callback_manager"
        });
        Object.defineProperty(this, "_parentRunId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.handlers = options?.handlers ?? this.handlers;
        this.inheritableHandlers =
            options?.inheritableHandlers ?? this.inheritableHandlers;
        this.tags = options?.tags ?? this.tags;
        this.inheritableTags = options?.inheritableTags ?? this.inheritableTags;
        this.metadata = options?.metadata ?? this.metadata;
        this.inheritableMetadata =
            options?.inheritableMetadata ?? this.inheritableMetadata;
        this._parentRunId = parentRunId;
    }
    /**
     * Gets the parent run ID, if any.
     *
     * @returns The parent run ID.
     */
    getParentRunId() {
        return this._parentRunId;
    }
    async handleLLMStart(llm, prompts, runId = undefined, _parentRunId = undefined, extraParams = undefined, _tags = undefined, _metadata = undefined, runName = undefined) {
        return Promise.all(prompts.map(async (prompt, idx) => {
            // Can't have duplicate runs with the same run ID (if provided)
            const runId_ = idx === 0 && runId ? runId : uuidv4();
            await Promise.all(this.handlers.map((handler) => {
                if (handler.ignoreLLM) {
                    return;
                }
                if (isBaseTracer(handler)) {
                    // Create and add run to the run map.
                    // We do this synchronously to avoid race conditions
                    // when callbacks are backgrounded.
                    handler._createRunForLLMStart(llm, [prompt], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                }
                return consumeCallback(async () => {
                    try {
                        await handler.handleLLMStart?.(llm, [prompt], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                    }
                    catch (err) {
                        const logFunction = handler.raiseError
                            ? console.error
                            : console.warn;
                        logFunction(`Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`);
                        if (handler.raiseError) {
                            throw err;
                        }
                    }
                }, handler.awaitHandlers);
            }));
            return new CallbackManagerForLLMRun(runId_, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
        }));
    }
    async handleChatModelStart(llm, messages, runId = undefined, _parentRunId = undefined, extraParams = undefined, _tags = undefined, _metadata = undefined, runName = undefined) {
        return Promise.all(messages.map(async (messageGroup, idx) => {
            // Can't have duplicate runs with the same run ID (if provided)
            const runId_ = idx === 0 && runId ? runId : uuidv4();
            await Promise.all(this.handlers.map((handler) => {
                if (handler.ignoreLLM) {
                    return;
                }
                if (isBaseTracer(handler)) {
                    // Create and add run to the run map.
                    // We do this synchronously to avoid race conditions
                    // when callbacks are backgrounded.
                    handler._createRunForChatModelStart(llm, [messageGroup], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                }
                return consumeCallback(async () => {
                    try {
                        if (handler.handleChatModelStart) {
                            await handler.handleChatModelStart?.(llm, [messageGroup], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                        }
                        else if (handler.handleLLMStart) {
                            const messageString = getBufferString(messageGroup);
                            await handler.handleLLMStart?.(llm, [messageString], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName);
                        }
                    }
                    catch (err) {
                        const logFunction = handler.raiseError
                            ? console.error
                            : console.warn;
                        logFunction(`Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`);
                        if (handler.raiseError) {
                            throw err;
                        }
                    }
                }, handler.awaitHandlers);
            }));
            return new CallbackManagerForLLMRun(runId_, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
        }));
    }
    async handleChainStart(chain, inputs, runId = uuidv4(), runType = undefined, _tags = undefined, _metadata = undefined, runName = undefined) {
        await Promise.all(this.handlers.map((handler) => {
            if (handler.ignoreChain) {
                return;
            }
            if (isBaseTracer(handler)) {
                // Create and add run to the run map.
                // We do this synchronously to avoid race conditions
                // when callbacks are backgrounded.
                handler._createRunForChainStart(chain, inputs, runId, this._parentRunId, this.tags, this.metadata, runType, runName);
            }
            return consumeCallback(async () => {
                try {
                    await handler.handleChainStart?.(chain, inputs, runId, this._parentRunId, this.tags, this.metadata, runType, runName);
                }
                catch (err) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleChainStart: ${err}`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }, handler.awaitHandlers);
        }));
        return new CallbackManagerForChainRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
    }
    async handleToolStart(tool, input, runId = uuidv4(), _parentRunId = undefined, _tags = undefined, _metadata = undefined, runName = undefined) {
        await Promise.all(this.handlers.map((handler) => {
            if (handler.ignoreAgent) {
                return;
            }
            if (isBaseTracer(handler)) {
                // Create and add run to the run map.
                // We do this synchronously to avoid race conditions
                // when callbacks are backgrounded.
                handler._createRunForToolStart(tool, input, runId, this._parentRunId, this.tags, this.metadata, runName);
            }
            return consumeCallback(async () => {
                try {
                    await handler.handleToolStart?.(tool, input, runId, this._parentRunId, this.tags, this.metadata, runName);
                }
                catch (err) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleToolStart: ${err}`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }, handler.awaitHandlers);
        }));
        return new CallbackManagerForToolRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
    }
    async handleRetrieverStart(retriever, query, runId = uuidv4(), _parentRunId = undefined, _tags = undefined, _metadata = undefined, runName = undefined) {
        await Promise.all(this.handlers.map((handler) => {
            if (handler.ignoreRetriever) {
                return;
            }
            if (isBaseTracer(handler)) {
                // Create and add run to the run map.
                // We do this synchronously to avoid race conditions
                // when callbacks are backgrounded.
                handler._createRunForRetrieverStart(retriever, query, runId, this._parentRunId, this.tags, this.metadata, runName);
            }
            return consumeCallback(async () => {
                try {
                    await handler.handleRetrieverStart?.(retriever, query, runId, this._parentRunId, this.tags, this.metadata, runName);
                }
                catch (err) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleRetrieverStart: ${err}`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }, handler.awaitHandlers);
        }));
        return new CallbackManagerForRetrieverRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
    }
    async handleCustomEvent(eventName, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data, runId, _tags, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _metadata) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            if (!handler.ignoreCustomEvent) {
                try {
                    await handler.handleCustomEvent?.(eventName, data, runId, this.tags, this.metadata);
                }
                catch (err) {
                    const logFunction = handler.raiseError
                        ? console.error
                        : console.warn;
                    logFunction(`Error in handler ${handler.constructor.name}, handleCustomEvent: ${err}`);
                    if (handler.raiseError) {
                        throw err;
                    }
                }
            }
        }, handler.awaitHandlers)));
    }
    addHandler(handler, inherit = true) {
        this.handlers.push(handler);
        if (inherit) {
            this.inheritableHandlers.push(handler);
        }
    }
    removeHandler(handler) {
        this.handlers = this.handlers.filter((_handler) => _handler !== handler);
        this.inheritableHandlers = this.inheritableHandlers.filter((_handler) => _handler !== handler);
    }
    setHandlers(handlers, inherit = true) {
        this.handlers = [];
        this.inheritableHandlers = [];
        for (const handler of handlers) {
            this.addHandler(handler, inherit);
        }
    }
    addTags(tags, inherit = true) {
        this.removeTags(tags); // Remove duplicates
        this.tags.push(...tags);
        if (inherit) {
            this.inheritableTags.push(...tags);
        }
    }
    removeTags(tags) {
        this.tags = this.tags.filter((tag) => !tags.includes(tag));
        this.inheritableTags = this.inheritableTags.filter((tag) => !tags.includes(tag));
    }
    addMetadata(metadata, inherit = true) {
        this.metadata = { ...this.metadata, ...metadata };
        if (inherit) {
            this.inheritableMetadata = { ...this.inheritableMetadata, ...metadata };
        }
    }
    removeMetadata(metadata) {
        for (const key of Object.keys(metadata)) {
            delete this.metadata[key];
            delete this.inheritableMetadata[key];
        }
    }
    copy(additionalHandlers = [], inherit = true) {
        const manager = new CallbackManager(this._parentRunId);
        for (const handler of this.handlers) {
            const inheritable = this.inheritableHandlers.includes(handler);
            manager.addHandler(handler, inheritable);
        }
        for (const tag of this.tags) {
            const inheritable = this.inheritableTags.includes(tag);
            manager.addTags([tag], inheritable);
        }
        for (const key of Object.keys(this.metadata)) {
            const inheritable = Object.keys(this.inheritableMetadata).includes(key);
            manager.addMetadata({ [key]: this.metadata[key] }, inheritable);
        }
        for (const handler of additionalHandlers) {
            if (
            // Prevent multiple copies of console_callback_handler
            manager.handlers
                .filter((h) => h.name === "console_callback_handler")
                .some((h) => h.name === handler.name)) {
                continue;
            }
            manager.addHandler(handler, inherit);
        }
        return manager;
    }
    static fromHandlers(handlers) {
        class Handler extends BaseCallbackHandler {
            constructor() {
                super();
                Object.defineProperty(this, "name", {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: uuidv4()
                });
                Object.assign(this, handlers);
            }
        }
        const manager = new this();
        manager.addHandler(new Handler());
        return manager;
    }
    static configure(inheritableHandlers, localHandlers, inheritableTags, localTags, inheritableMetadata, localMetadata, options) {
        return this._configureSync(inheritableHandlers, localHandlers, inheritableTags, localTags, inheritableMetadata, localMetadata, options);
    }
    // TODO: Deprecate async method in favor of this one.
    static _configureSync(inheritableHandlers, localHandlers, inheritableTags, localTags, inheritableMetadata, localMetadata, options) {
        let callbackManager;
        if (inheritableHandlers || localHandlers) {
            if (Array.isArray(inheritableHandlers) || !inheritableHandlers) {
                callbackManager = new CallbackManager();
                callbackManager.setHandlers(inheritableHandlers?.map(ensureHandler) ?? [], true);
            }
            else {
                callbackManager = inheritableHandlers;
            }
            callbackManager = callbackManager.copy(Array.isArray(localHandlers)
                ? localHandlers.map(ensureHandler)
                : localHandlers?.handlers, false);
        }
        const verboseEnabled = getEnvironmentVariable("LANGCHAIN_VERBOSE") === "true" ||
            options?.verbose;
        const tracingV2Enabled = LangChainTracer.getTraceableRunTree()?.tracingEnabled ||
            isTracingEnabled();
        const tracingEnabled = tracingV2Enabled ||
            (getEnvironmentVariable("LANGCHAIN_TRACING") ?? false);
        if (verboseEnabled || tracingEnabled) {
            if (!callbackManager) {
                callbackManager = new CallbackManager();
            }
            if (verboseEnabled &&
                !callbackManager.handlers.some((handler) => handler.name === ConsoleCallbackHandler.prototype.name)) {
                const consoleHandler = new ConsoleCallbackHandler();
                callbackManager.addHandler(consoleHandler, true);
            }
            if (tracingEnabled &&
                !callbackManager.handlers.some((handler) => handler.name === "langchain_tracer")) {
                if (tracingV2Enabled) {
                    const tracerV2 = new LangChainTracer();
                    callbackManager.addHandler(tracerV2, true);
                    // handoff between langchain and langsmith/traceable
                    // override the parent run ID
                    callbackManager._parentRunId =
                        LangChainTracer.getTraceableRunTree()?.id ??
                            callbackManager._parentRunId;
                }
            }
        }
        for (const { contextVar, inheritable = true, handlerClass, envVar, } of _getConfigureHooks()) {
            const createIfNotInContext = envVar && getEnvironmentVariable(envVar) === "true" && handlerClass;
            let handler;
            const contextVarValue = contextVar !== undefined ? getContextVariable(contextVar) : undefined;
            if (contextVarValue && isBaseCallbackHandler(contextVarValue)) {
                handler = contextVarValue;
            }
            else if (createIfNotInContext) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                handler = new handlerClass({});
            }
            if (handler !== undefined) {
                if (!callbackManager) {
                    callbackManager = new CallbackManager();
                }
                if (!callbackManager.handlers.some((h) => h.name === handler.name)) {
                    callbackManager.addHandler(handler, inheritable);
                }
            }
        }
        if (inheritableTags || localTags) {
            if (callbackManager) {
                callbackManager.addTags(inheritableTags ?? []);
                callbackManager.addTags(localTags ?? [], false);
            }
        }
        if (inheritableMetadata || localMetadata) {
            if (callbackManager) {
                callbackManager.addMetadata(inheritableMetadata ?? {});
                callbackManager.addMetadata(localMetadata ?? {}, false);
            }
        }
        return callbackManager;
    }
}
export function ensureHandler(handler) {
    if ("name" in handler) {
        return handler;
    }
    return BaseCallbackHandler.fromMethods(handler);
}
/**
 * @deprecated Use [`traceable`](https://docs.smith.langchain.com/observability/how_to_guides/tracing/annotate_code)
 * from "langsmith" instead.
 */
export class TraceGroup {
    constructor(groupName, options) {
        Object.defineProperty(this, "groupName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: groupName
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        Object.defineProperty(this, "runManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    async getTraceGroupCallbackManager(group_name, inputs, options) {
        const cb = new LangChainTracer(options);
        const cm = await CallbackManager.configure([cb]);
        const runManager = await cm?.handleChainStart({
            lc: 1,
            type: "not_implemented",
            id: ["langchain", "callbacks", "groups", group_name],
        }, inputs ?? {});
        if (!runManager) {
            throw new Error("Failed to create run group callback manager.");
        }
        return runManager;
    }
    async start(inputs) {
        if (!this.runManager) {
            this.runManager = await this.getTraceGroupCallbackManager(this.groupName, inputs, this.options);
        }
        return this.runManager.getChild();
    }
    async error(err) {
        if (this.runManager) {
            await this.runManager.handleChainError(err);
            this.runManager = undefined;
        }
    }
    async end(output) {
        if (this.runManager) {
            await this.runManager.handleChainEnd(output ?? {});
            this.runManager = undefined;
        }
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _coerceToDict(value, defaultKey) {
    return value && !Array.isArray(value) && typeof value === "object"
        ? value
        : { [defaultKey]: value };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function traceAsGroup(groupOptions, enclosedCode, ...args) {
    const traceGroup = new TraceGroup(groupOptions.name, groupOptions);
    const callbackManager = await traceGroup.start({ ...args });
    try {
        const result = await enclosedCode(callbackManager, ...args);
        await traceGroup.end(_coerceToDict(result, "output"));
        return result;
    }
    catch (err) {
        await traceGroup.error(err);
        throw err;
    }
}
