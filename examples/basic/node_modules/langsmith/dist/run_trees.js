import * as uuid from "uuid";
import { getEnvironmentVariable, getLangSmithEnvironmentVariable, getRuntimeEnvironment, } from "./utils/env.js";
import { Client } from "./client.js";
import { isTracingEnabled } from "./env.js";
import { warnOnce } from "./utils/warn.js";
import { _LC_CONTEXT_VARIABLES_KEY } from "./singletons/constants.js";
function stripNonAlphanumeric(input) {
    return input.replace(/[-:.]/g, "");
}
export function convertToDottedOrderFormat(epoch, runId, executionOrder = 1) {
    // Date only has millisecond precision, so we use the microseconds to break
    // possible ties, avoiding incorrect run order
    const paddedOrder = executionOrder.toFixed(0).slice(0, 3).padStart(3, "0");
    return (stripNonAlphanumeric(`${new Date(epoch).toISOString().slice(0, -1)}${paddedOrder}Z`) + runId);
}
/**
 * Baggage header information
 */
class Baggage {
    constructor(metadata, tags) {
        Object.defineProperty(this, "metadata", {
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
        this.metadata = metadata;
        this.tags = tags;
    }
    static fromHeader(value) {
        const items = value.split(",");
        let metadata = {};
        let tags = [];
        for (const item of items) {
            const [key, uriValue] = item.split("=");
            const value = decodeURIComponent(uriValue);
            if (key === "langsmith-metadata") {
                metadata = JSON.parse(value);
            }
            else if (key === "langsmith-tags") {
                tags = value.split(",");
            }
        }
        return new Baggage(metadata, tags);
    }
    toHeader() {
        const items = [];
        if (this.metadata && Object.keys(this.metadata).length > 0) {
            items.push(`langsmith-metadata=${encodeURIComponent(JSON.stringify(this.metadata))}`);
        }
        if (this.tags && this.tags.length > 0) {
            items.push(`langsmith-tags=${encodeURIComponent(this.tags.join(","))}`);
        }
        return items.join(",");
    }
}
export class RunTree {
    constructor(originalConfig) {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "run_type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "project_name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "parent_run", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "child_runs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "start_time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "end_time", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "extra", {
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
        Object.defineProperty(this, "error", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "serialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inputs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "reference_example_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "trace_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dotted_order", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tracingEnabled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "execution_order", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "child_execution_order", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Attachments associated with the run.
         * Each entry is a tuple of [mime_type, bytes]
         */
        Object.defineProperty(this, "attachments", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // If you pass in a run tree directly, return a shallow clone
        if (isRunTree(originalConfig)) {
            Object.assign(this, { ...originalConfig });
            return;
        }
        const defaultConfig = RunTree.getDefaultConfig();
        const { metadata, ...config } = originalConfig;
        const client = config.client ?? RunTree.getSharedClient();
        const dedupedMetadata = {
            ...metadata,
            ...config?.extra?.metadata,
        };
        config.extra = { ...config.extra, metadata: dedupedMetadata };
        Object.assign(this, { ...defaultConfig, ...config, client });
        if (!this.trace_id) {
            if (this.parent_run) {
                this.trace_id = this.parent_run.trace_id ?? this.id;
            }
            else {
                this.trace_id = this.id;
            }
        }
        this.execution_order ??= 1;
        this.child_execution_order ??= 1;
        if (!this.dotted_order) {
            const currentDottedOrder = convertToDottedOrderFormat(this.start_time, this.id, this.execution_order);
            if (this.parent_run) {
                this.dotted_order =
                    this.parent_run.dotted_order + "." + currentDottedOrder;
            }
            else {
                this.dotted_order = currentDottedOrder;
            }
        }
    }
    static getDefaultConfig() {
        return {
            id: uuid.v4(),
            run_type: "chain",
            project_name: getLangSmithEnvironmentVariable("PROJECT") ??
                getEnvironmentVariable("LANGCHAIN_SESSION") ?? // TODO: Deprecate
                "default",
            child_runs: [],
            api_url: getEnvironmentVariable("LANGCHAIN_ENDPOINT") ?? "http://localhost:1984",
            api_key: getEnvironmentVariable("LANGCHAIN_API_KEY"),
            caller_options: {},
            start_time: Date.now(),
            serialized: {},
            inputs: {},
            extra: {},
        };
    }
    static getSharedClient() {
        if (!RunTree.sharedClient) {
            RunTree.sharedClient = new Client();
        }
        return RunTree.sharedClient;
    }
    createChild(config) {
        const child_execution_order = this.child_execution_order + 1;
        const child = new RunTree({
            ...config,
            parent_run: this,
            project_name: this.project_name,
            client: this.client,
            tracingEnabled: this.tracingEnabled,
            execution_order: child_execution_order,
            child_execution_order: child_execution_order,
        });
        // Copy context vars over into the new run tree.
        if (_LC_CONTEXT_VARIABLES_KEY in this) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            child[_LC_CONTEXT_VARIABLES_KEY] =
                this[_LC_CONTEXT_VARIABLES_KEY];
        }
        const LC_CHILD = Symbol.for("lc:child_config");
        const presentConfig = config.extra?.[LC_CHILD] ??
            this.extra[LC_CHILD];
        // tracing for LangChain is defined by the _parentRunId and runMap of the tracer
        if (isRunnableConfigLike(presentConfig)) {
            const newConfig = { ...presentConfig };
            const callbacks = isCallbackManagerLike(newConfig.callbacks)
                ? newConfig.callbacks.copy?.()
                : undefined;
            if (callbacks) {
                // update the parent run id
                Object.assign(callbacks, { _parentRunId: child.id });
                // only populate if we're in a newer LC.JS version
                callbacks.handlers
                    ?.find(isLangChainTracerLike)
                    ?.updateFromRunTree?.(child);
                newConfig.callbacks = callbacks;
            }
            child.extra[LC_CHILD] = newConfig;
        }
        // propagate child_execution_order upwards
        const visited = new Set();
        let current = this;
        while (current != null && !visited.has(current.id)) {
            visited.add(current.id);
            current.child_execution_order = Math.max(current.child_execution_order, child_execution_order);
            current = current.parent_run;
        }
        this.child_runs.push(child);
        return child;
    }
    async end(outputs, error, endTime = Date.now(), metadata) {
        this.outputs = this.outputs ?? outputs;
        this.error = this.error ?? error;
        this.end_time = this.end_time ?? endTime;
        if (metadata && Object.keys(metadata).length > 0) {
            this.extra = this.extra
                ? { ...this.extra, metadata: { ...this.extra.metadata, ...metadata } }
                : { metadata };
        }
    }
    _convertToCreate(run, runtimeEnv, excludeChildRuns = true) {
        const runExtra = run.extra ?? {};
        if (!runExtra.runtime) {
            runExtra.runtime = {};
        }
        if (runtimeEnv) {
            for (const [k, v] of Object.entries(runtimeEnv)) {
                if (!runExtra.runtime[k]) {
                    runExtra.runtime[k] = v;
                }
            }
        }
        let child_runs;
        let parent_run_id;
        if (!excludeChildRuns) {
            child_runs = run.child_runs.map((child_run) => this._convertToCreate(child_run, runtimeEnv, excludeChildRuns));
            parent_run_id = undefined;
        }
        else {
            parent_run_id = run.parent_run?.id;
            child_runs = [];
        }
        const persistedRun = {
            id: run.id,
            name: run.name,
            start_time: run.start_time,
            end_time: run.end_time,
            run_type: run.run_type,
            reference_example_id: run.reference_example_id,
            extra: runExtra,
            serialized: run.serialized,
            error: run.error,
            inputs: run.inputs,
            outputs: run.outputs,
            session_name: run.project_name,
            child_runs: child_runs,
            parent_run_id: parent_run_id,
            trace_id: run.trace_id,
            dotted_order: run.dotted_order,
            tags: run.tags,
            attachments: run.attachments,
        };
        return persistedRun;
    }
    async postRun(excludeChildRuns = true) {
        try {
            const runtimeEnv = getRuntimeEnvironment();
            const runCreate = await this._convertToCreate(this, runtimeEnv, true);
            await this.client.createRun(runCreate);
            if (!excludeChildRuns) {
                warnOnce("Posting with excludeChildRuns=false is deprecated and will be removed in a future version.");
                for (const childRun of this.child_runs) {
                    await childRun.postRun(false);
                }
            }
        }
        catch (error) {
            console.error(`Error in postRun for run ${this.id}:`, error);
        }
    }
    async patchRun() {
        try {
            const runUpdate = {
                end_time: this.end_time,
                error: this.error,
                inputs: this.inputs,
                outputs: this.outputs,
                parent_run_id: this.parent_run?.id,
                reference_example_id: this.reference_example_id,
                extra: this.extra,
                events: this.events,
                dotted_order: this.dotted_order,
                trace_id: this.trace_id,
                tags: this.tags,
                attachments: this.attachments,
            };
            await this.client.updateRun(this.id, runUpdate);
        }
        catch (error) {
            console.error(`Error in patchRun for run ${this.id}`, error);
        }
    }
    toJSON() {
        return this._convertToCreate(this, undefined, false);
    }
    /**
     * Add an event to the run tree.
     * @param event - A single event or string to add
     */
    addEvent(event) {
        if (!this.events) {
            this.events = [];
        }
        if (typeof event === "string") {
            this.events.push({
                name: "event",
                time: new Date().toISOString(),
                message: event,
            });
        }
        else {
            this.events.push({
                ...event,
                time: event.time ?? new Date().toISOString(),
            });
        }
    }
    static fromRunnableConfig(parentConfig, props) {
        // We only handle the callback manager case for now
        const callbackManager = parentConfig?.callbacks;
        let parentRun;
        let projectName;
        let client;
        let tracingEnabled = isTracingEnabled();
        if (callbackManager) {
            const parentRunId = callbackManager?.getParentRunId?.() ?? "";
            const langChainTracer = callbackManager?.handlers?.find((handler) => handler?.name == "langchain_tracer");
            parentRun = langChainTracer?.getRun?.(parentRunId);
            projectName = langChainTracer?.projectName;
            client = langChainTracer?.client;
            tracingEnabled = tracingEnabled || !!langChainTracer;
        }
        if (!parentRun) {
            return new RunTree({
                ...props,
                client,
                tracingEnabled,
                project_name: projectName,
            });
        }
        const parentRunTree = new RunTree({
            name: parentRun.name,
            id: parentRun.id,
            trace_id: parentRun.trace_id,
            dotted_order: parentRun.dotted_order,
            client,
            tracingEnabled,
            project_name: projectName,
            tags: [
                ...new Set((parentRun?.tags ?? []).concat(parentConfig?.tags ?? [])),
            ],
            extra: {
                metadata: {
                    ...parentRun?.extra?.metadata,
                    ...parentConfig?.metadata,
                },
            },
        });
        return parentRunTree.createChild(props);
    }
    static fromDottedOrder(dottedOrder) {
        return this.fromHeaders({ "langsmith-trace": dottedOrder });
    }
    static fromHeaders(headers, inheritArgs) {
        const rawHeaders = "get" in headers && typeof headers.get === "function"
            ? {
                "langsmith-trace": headers.get("langsmith-trace"),
                baggage: headers.get("baggage"),
            }
            : headers;
        const headerTrace = rawHeaders["langsmith-trace"];
        if (!headerTrace || typeof headerTrace !== "string")
            return undefined;
        const parentDottedOrder = headerTrace.trim();
        const parsedDottedOrder = parentDottedOrder.split(".").map((part) => {
            const [strTime, uuid] = part.split("Z");
            return { strTime, time: Date.parse(strTime + "Z"), uuid };
        });
        const traceId = parsedDottedOrder[0].uuid;
        const config = {
            ...inheritArgs,
            name: inheritArgs?.["name"] ?? "parent",
            run_type: inheritArgs?.["run_type"] ?? "chain",
            start_time: inheritArgs?.["start_time"] ?? Date.now(),
            id: parsedDottedOrder.at(-1)?.uuid,
            trace_id: traceId,
            dotted_order: parentDottedOrder,
        };
        if (rawHeaders["baggage"] && typeof rawHeaders["baggage"] === "string") {
            const baggage = Baggage.fromHeader(rawHeaders["baggage"]);
            config.metadata = baggage.metadata;
            config.tags = baggage.tags;
        }
        return new RunTree(config);
    }
    toHeaders(headers) {
        const result = {
            "langsmith-trace": this.dotted_order,
            baggage: new Baggage(this.extra?.metadata, this.tags).toHeader(),
        };
        if (headers) {
            for (const [key, value] of Object.entries(result)) {
                headers.set(key, value);
            }
        }
        return result;
    }
}
Object.defineProperty(RunTree, "sharedClient", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: null
});
export function isRunTree(x) {
    return (x !== undefined &&
        typeof x.createChild === "function" &&
        typeof x.postRun === "function");
}
function isLangChainTracerLike(x) {
    return (typeof x === "object" &&
        x != null &&
        typeof x.name === "string" &&
        x.name === "langchain_tracer");
}
function containsLangChainTracerLike(x) {
    return (Array.isArray(x) && x.some((callback) => isLangChainTracerLike(callback)));
}
function isCallbackManagerLike(x) {
    return (typeof x === "object" &&
        x != null &&
        Array.isArray(x.handlers));
}
export function isRunnableConfigLike(x) {
    // Check that it's an object with a callbacks arg
    // that has either a CallbackManagerLike object with a langchain tracer within it
    // or an array with a LangChainTracerLike object within it
    return (x !== undefined &&
        typeof x.callbacks === "object" &&
        // Callback manager with a langchain tracer
        (containsLangChainTracerLike(x.callbacks?.handlers) ||
            // Or it's an array with a LangChainTracerLike object within it
            containsLangChainTracerLike(x.callbacks)));
}
