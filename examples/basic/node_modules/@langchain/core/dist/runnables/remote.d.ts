import { Runnable, RunnableBatchOptions } from "./base.js";
import { type RunnableConfig } from "./config.js";
import { CallbackManagerForChainRun } from "../callbacks/manager.js";
import { RunLogPatch, type LogStreamCallbackHandlerInput, type StreamEvent } from "../tracers/log_stream.js";
import { IterableReadableStream } from "../utils/stream.js";
type RemoteRunnableOptions = {
    timeout?: number;
    headers?: Record<string, unknown>;
};
/**
 * Client for interacting with LangChain runnables
 * that are hosted as LangServe endpoints.
 *
 * Allows you to interact with hosted runnables using the standard
 * `.invoke()`, `.stream()`, `.streamEvents()`, etc. methods that
 * other runnables support.
 *
 * @param url - The base URL of the LangServe endpoint.
 * @param options - Optional configuration for the remote runnable, including timeout and headers.
 * @param fetch - Optional custom fetch implementation.
 * @param fetchRequestOptions - Optional additional options for fetch requests.
 */
export declare class RemoteRunnable<RunInput, RunOutput, CallOptions extends RunnableConfig> extends Runnable<RunInput, RunOutput, CallOptions> {
    private url;
    private options?;
    fetchImplementation: (...args: any[]) => any;
    fetchRequestOptions?: Record<string, any>;
    lc_namespace: string[];
    constructor(fields: {
        url: string;
        options?: RemoteRunnableOptions;
        fetch?: (...args: any[]) => any;
        fetchRequestOptions?: Record<string, any>;
    });
    private post;
    _invoke(input: RunInput, options?: Partial<CallOptions>, _?: CallbackManagerForChainRun): Promise<RunOutput>;
    invoke(input: RunInput, options?: Partial<CallOptions>): Promise<RunOutput>;
    _batch(inputs: RunInput[], options?: Partial<CallOptions>[], _?: (CallbackManagerForChainRun | undefined)[], batchOptions?: RunnableBatchOptions): Promise<(RunOutput | Error)[]>;
    batch(inputs: RunInput[], options?: Partial<CallOptions> | Partial<CallOptions>[], batchOptions?: RunnableBatchOptions & {
        returnExceptions?: false;
    }): Promise<RunOutput[]>;
    batch(inputs: RunInput[], options?: Partial<CallOptions> | Partial<CallOptions>[], batchOptions?: RunnableBatchOptions & {
        returnExceptions: true;
    }): Promise<(RunOutput | Error)[]>;
    batch(inputs: RunInput[], options?: Partial<CallOptions> | Partial<CallOptions>[], batchOptions?: RunnableBatchOptions): Promise<(RunOutput | Error)[]>;
    _streamIterator(input: RunInput, options?: Partial<CallOptions>): AsyncGenerator<RunOutput>;
    streamLog(input: RunInput, options?: Partial<CallOptions>, streamOptions?: Omit<LogStreamCallbackHandlerInput, "autoClose">): AsyncGenerator<RunLogPatch>;
    _streamEvents(input: RunInput, options: Partial<CallOptions> & {
        version: "v1" | "v2";
    }, streamOptions?: Omit<LogStreamCallbackHandlerInput, "autoClose"> | undefined): AsyncGenerator<StreamEvent>;
    streamEvents(input: RunInput, options: Partial<CallOptions> & {
        version: "v1" | "v2";
    }, streamOptions?: Omit<LogStreamCallbackHandlerInput, "autoClose">): IterableReadableStream<StreamEvent>;
    streamEvents(input: RunInput, options: Partial<CallOptions> & {
        version: "v1" | "v2";
        encoding: "text/event-stream";
    }, streamOptions?: Omit<LogStreamCallbackHandlerInput, "autoClose">): IterableReadableStream<Uint8Array>;
}
export {};
