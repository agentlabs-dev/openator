import { BaseTracer, type Run } from "./base.js";
import { BaseCallbackHandler, BaseCallbackHandlerInput, CallbackHandlerPrefersStreaming } from "../callbacks/base.js";
import { IterableReadableStream } from "../utils/stream.js";
/**
 * Data associated with a StreamEvent.
 */
export type StreamEventData = {
    /**
     * The input passed to the runnable that generated the event.
     * Inputs will sometimes be available at the *START* of the runnable, and
     * sometimes at the *END* of the runnable.
     * If a runnable is able to stream its inputs, then its input by definition
     * won't be known until the *END* of the runnable when it has finished streaming
     * its inputs.
     */
    input?: any;
    /**
     * The output of the runnable that generated the event.
     * Outputs will only be available at the *END* of the runnable.
     * For most runnables, this field can be inferred from the `chunk` field,
     * though there might be some exceptions for special cased runnables (e.g., like
     * chat models), which may return more information.
     */
    output?: any;
    /**
     * A streaming chunk from the output that generated the event.
     * chunks support addition in general, and adding them up should result
     * in the output of the runnable that generated the event.
     */
    chunk?: any;
};
/**
 * A streaming event.
 *
 * Schema of a streaming event which is produced from the streamEvents method.
 */
export type StreamEvent = {
    /**
     * Event names are of the format: on_[runnable_type]_(start|stream|end).
     *
     * Runnable types are one of:
     * - llm - used by non chat models
     * - chat_model - used by chat models
     * - prompt --  e.g., ChatPromptTemplate
     * - tool -- LangChain tools
     * - chain - most Runnables are of this type
     *
     * Further, the events are categorized as one of:
     * - start - when the runnable starts
     * - stream - when the runnable is streaming
     * - end - when the runnable ends
     *
     * start, stream and end are associated with slightly different `data` payload.
     *
     * Please see the documentation for `EventData` for more details.
     */
    event: string;
    /** The name of the runnable that generated the event. */
    name: string;
    /**
     * An randomly generated ID to keep track of the execution of the given runnable.
     *
     * Each child runnable that gets invoked as part of the execution of a parent runnable
     * is assigned its own unique ID.
     */
    run_id: string;
    /**
     * Tags associated with the runnable that generated this event.
     * Tags are always inherited from parent runnables.
     */
    tags?: string[];
    /** Metadata associated with the runnable that generated this event. */
    metadata: Record<string, any>;
    /**
     * Event data.
     *
     * The contents of the event data depend on the event type.
     */
    data: StreamEventData;
};
type RunInfo = {
    name: string;
    tags: string[];
    metadata: Record<string, any>;
    runType: string;
    inputs?: Record<string, any>;
};
export interface EventStreamCallbackHandlerInput extends BaseCallbackHandlerInput {
    autoClose?: boolean;
    includeNames?: string[];
    includeTypes?: string[];
    includeTags?: string[];
    excludeNames?: string[];
    excludeTypes?: string[];
    excludeTags?: string[];
}
export declare const isStreamEventsHandler: (handler: BaseCallbackHandler) => handler is EventStreamCallbackHandler;
/**
 * Class that extends the `BaseTracer` class from the
 * `langchain.callbacks.tracers.base` module. It represents a callback
 * handler that logs the execution of runs and emits `RunLog` instances to a
 * `RunLogStream`.
 */
export declare class EventStreamCallbackHandler extends BaseTracer implements CallbackHandlerPrefersStreaming {
    protected autoClose: boolean;
    protected includeNames?: string[];
    protected includeTypes?: string[];
    protected includeTags?: string[];
    protected excludeNames?: string[];
    protected excludeTypes?: string[];
    protected excludeTags?: string[];
    private runInfoMap;
    private tappedPromises;
    protected transformStream: TransformStream;
    writer: WritableStreamDefaultWriter;
    receiveStream: IterableReadableStream<StreamEvent>;
    name: string;
    lc_prefer_streaming: boolean;
    constructor(fields?: EventStreamCallbackHandlerInput);
    [Symbol.asyncIterator](): IterableReadableStream<StreamEvent>;
    protected persistRun(_run: Run): Promise<void>;
    _includeRun(run: RunInfo): boolean;
    tapOutputIterable<T>(runId: string, outputStream: AsyncGenerator<T>): AsyncGenerator<T>;
    send(payload: StreamEvent, run: RunInfo): Promise<void>;
    sendEndEvent(payload: StreamEvent, run: RunInfo): Promise<void>;
    onLLMStart(run: Run): Promise<void>;
    onLLMNewToken(run: Run, token: string, kwargs?: {
        chunk: any;
    }): Promise<void>;
    onLLMEnd(run: Run): Promise<void>;
    onChainStart(run: Run): Promise<void>;
    onChainEnd(run: Run): Promise<void>;
    onToolStart(run: Run): Promise<void>;
    onToolEnd(run: Run): Promise<void>;
    onRetrieverStart(run: Run): Promise<void>;
    onRetrieverEnd(run: Run): Promise<void>;
    handleCustomEvent(eventName: string, data: any, runId: string): Promise<void>;
    finish(): Promise<void>;
}
export {};
