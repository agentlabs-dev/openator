import { Attachments, BaseRun, KVMap, RunCreate } from "./schemas.js";
import { Client } from "./client.js";
export declare function convertToDottedOrderFormat(epoch: number, runId: string, executionOrder?: number): string;
export interface RunTreeConfig {
    name: string;
    run_type?: string;
    id?: string;
    project_name?: string;
    parent_run?: RunTree;
    parent_run_id?: string;
    child_runs?: RunTree[];
    start_time?: number;
    end_time?: number;
    extra?: KVMap;
    metadata?: KVMap;
    tags?: string[];
    error?: string;
    serialized?: object;
    inputs?: KVMap;
    outputs?: KVMap;
    reference_example_id?: string;
    client?: Client;
    tracingEnabled?: boolean;
    on_end?: (runTree: RunTree) => void;
    execution_order?: number;
    child_execution_order?: number;
    trace_id?: string;
    dotted_order?: string;
    attachments?: Attachments;
}
export interface RunnableConfigLike {
    /**
     * Tags for this call and any sub-calls (eg. a Chain calling an LLM).
     * You can use these to filter calls.
     */
    tags?: string[];
    /**
     * Metadata for this call and any sub-calls (eg. a Chain calling an LLM).
     * Keys should be strings, values should be JSON-serializable.
     */
    metadata?: Record<string, unknown>;
    /**
     * Callbacks for this call and any sub-calls (eg. a Chain calling an LLM).
     * Tags are passed to all callbacks, metadata is passed to handle*Start callbacks.
     */
    callbacks?: any;
}
interface HeadersLike {
    get(name: string): string | null;
    set(name: string, value: string): void;
}
export declare class RunTree implements BaseRun {
    private static sharedClient;
    id: string;
    name: RunTreeConfig["name"];
    run_type: string;
    project_name: string;
    parent_run?: RunTree;
    child_runs: RunTree[];
    start_time: number;
    end_time?: number;
    extra: KVMap;
    tags?: string[];
    error?: string;
    serialized: object;
    inputs: KVMap;
    outputs?: KVMap;
    reference_example_id?: string;
    client: Client;
    events?: KVMap[] | undefined;
    trace_id: string;
    dotted_order: string;
    tracingEnabled?: boolean;
    execution_order: number;
    child_execution_order: number;
    /**
     * Attachments associated with the run.
     * Each entry is a tuple of [mime_type, bytes]
     */
    attachments?: Attachments;
    constructor(originalConfig: RunTreeConfig | RunTree);
    private static getDefaultConfig;
    private static getSharedClient;
    createChild(config: RunTreeConfig): RunTree;
    end(outputs?: KVMap, error?: string, endTime?: number, metadata?: KVMap): Promise<void>;
    private _convertToCreate;
    postRun(excludeChildRuns?: boolean): Promise<void>;
    patchRun(): Promise<void>;
    toJSON(): RunCreate;
    /**
     * Add an event to the run tree.
     * @param event - A single event or string to add
     */
    addEvent(event: RunEvent | string): void;
    static fromRunnableConfig(parentConfig: RunnableConfigLike, props: RunTreeConfig): RunTree;
    static fromDottedOrder(dottedOrder: string): RunTree | undefined;
    static fromHeaders(headers: Record<string, string | string[]> | HeadersLike, inheritArgs?: RunTreeConfig): RunTree | undefined;
    toHeaders(headers?: HeadersLike): {
        "langsmith-trace": string;
        baggage: string;
    };
}
export declare function isRunTree(x?: unknown): x is RunTree;
export interface RunEvent {
    name?: string;
    time?: string;
    message?: string;
    kwargs?: Record<string, unknown>;
    [key: string]: unknown;
}
export declare function isRunnableConfigLike(x?: unknown): x is RunnableConfigLike;
export {};
