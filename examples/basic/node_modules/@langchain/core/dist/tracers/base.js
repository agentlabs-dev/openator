import { BaseCallbackHandler, } from "../callbacks/base.js";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _coerceToDict(value, defaultKey) {
    return value && !Array.isArray(value) && typeof value === "object"
        ? value
        : { [defaultKey]: value };
}
function stripNonAlphanumeric(input) {
    return input.replace(/[-:.]/g, "");
}
function convertToDottedOrderFormat(epoch, runId, executionOrder) {
    const paddedOrder = executionOrder.toFixed(0).slice(0, 3).padStart(3, "0");
    return (stripNonAlphanumeric(`${new Date(epoch).toISOString().slice(0, -1)}${paddedOrder}Z`) + runId);
}
export function isBaseTracer(x) {
    return typeof x._addRunToRunMap === "function";
}
export class BaseTracer extends BaseCallbackHandler {
    constructor(_fields) {
        super(...arguments);
        Object.defineProperty(this, "runMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    copy() {
        return this;
    }
    stringifyError(error) {
        // eslint-disable-next-line no-instanceof/no-instanceof
        if (error instanceof Error) {
            return error.message + (error?.stack ? `\n\n${error.stack}` : "");
        }
        if (typeof error === "string") {
            return error;
        }
        return `${error}`;
    }
    _addChildRun(parentRun, childRun) {
        parentRun.child_runs.push(childRun);
    }
    _addRunToRunMap(run) {
        const currentDottedOrder = convertToDottedOrderFormat(run.start_time, run.id, run.execution_order);
        const storedRun = { ...run };
        if (storedRun.parent_run_id !== undefined) {
            const parentRun = this.runMap.get(storedRun.parent_run_id);
            if (parentRun) {
                this._addChildRun(parentRun, storedRun);
                parentRun.child_execution_order = Math.max(parentRun.child_execution_order, storedRun.child_execution_order);
                storedRun.trace_id = parentRun.trace_id;
                if (parentRun.dotted_order !== undefined) {
                    storedRun.dotted_order = [
                        parentRun.dotted_order,
                        currentDottedOrder,
                    ].join(".");
                }
                else {
                    // This can happen naturally for callbacks added within a run
                    // console.debug(`Parent run with UUID ${storedRun.parent_run_id} has no dotted order.`);
                }
            }
            else {
                // This can happen naturally for callbacks added within a run
                // console.debug(
                //   `Parent run with UUID ${storedRun.parent_run_id} not found.`
                // );
            }
        }
        else {
            storedRun.trace_id = storedRun.id;
            storedRun.dotted_order = currentDottedOrder;
        }
        this.runMap.set(storedRun.id, storedRun);
        return storedRun;
    }
    async _endTrace(run) {
        const parentRun = run.parent_run_id !== undefined && this.runMap.get(run.parent_run_id);
        if (parentRun) {
            parentRun.child_execution_order = Math.max(parentRun.child_execution_order, run.child_execution_order);
        }
        else {
            await this.persistRun(run);
        }
        this.runMap.delete(run.id);
        await this.onRunUpdate?.(run);
    }
    _getExecutionOrder(parentRunId) {
        const parentRun = parentRunId !== undefined && this.runMap.get(parentRunId);
        // If a run has no parent then execution order is 1
        if (!parentRun) {
            return 1;
        }
        return parentRun.child_execution_order + 1;
    }
    /**
     * Create and add a run to the run map for LLM start events.
     * This must sometimes be done synchronously to avoid race conditions
     * when callbacks are backgrounded, so we expose it as a separate method here.
     */
    _createRunForLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const finalExtraParams = metadata
            ? { ...extraParams, metadata }
            : extraParams;
        const run = {
            id: runId,
            name: name ?? llm.id[llm.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: llm,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString(),
                },
            ],
            inputs: { prompts },
            execution_order,
            child_runs: [],
            child_execution_order: execution_order,
            run_type: "llm",
            extra: finalExtraParams ?? {},
            tags: tags || [],
        };
        return this._addRunToRunMap(run);
    }
    async handleLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata, name) {
        const run = this.runMap.get(runId) ??
            this._createRunForLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onLLMStart?.(run);
        return run;
    }
    /**
     * Create and add a run to the run map for chat model start events.
     * This must sometimes be done synchronously to avoid race conditions
     * when callbacks are backgrounded, so we expose it as a separate method here.
     */
    _createRunForChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const finalExtraParams = metadata
            ? { ...extraParams, metadata }
            : extraParams;
        const run = {
            id: runId,
            name: name ?? llm.id[llm.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: llm,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString(),
                },
            ],
            inputs: { messages },
            execution_order,
            child_runs: [],
            child_execution_order: execution_order,
            run_type: "llm",
            extra: finalExtraParams ?? {},
            tags: tags || [],
        };
        return this._addRunToRunMap(run);
    }
    async handleChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name) {
        const run = this.runMap.get(runId) ??
            this._createRunForChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onLLMStart?.(run);
        return run;
    }
    async handleLLMEnd(output, runId, _parentRunId, _tags, extraParams) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "llm") {
            throw new Error("No LLM run to end.");
        }
        run.end_time = Date.now();
        run.outputs = output;
        run.events.push({
            name: "end",
            time: new Date(run.end_time).toISOString(),
        });
        run.extra = { ...run.extra, ...extraParams };
        await this.onLLMEnd?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleLLMError(error, runId, _parentRunId, _tags, extraParams) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "llm") {
            throw new Error("No LLM run to end.");
        }
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
            name: "error",
            time: new Date(run.end_time).toISOString(),
        });
        run.extra = { ...run.extra, ...extraParams };
        await this.onLLMError?.(run);
        await this._endTrace(run);
        return run;
    }
    /**
     * Create and add a run to the run map for chain start events.
     * This must sometimes be done synchronously to avoid race conditions
     * when callbacks are backgrounded, so we expose it as a separate method here.
     */
    _createRunForChainStart(chain, inputs, runId, parentRunId, tags, metadata, runType, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
            id: runId,
            name: name ?? chain.id[chain.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: chain,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString(),
                },
            ],
            inputs,
            execution_order,
            child_execution_order: execution_order,
            run_type: runType ?? "chain",
            child_runs: [],
            extra: metadata ? { metadata } : {},
            tags: tags || [],
        };
        return this._addRunToRunMap(run);
    }
    async handleChainStart(chain, inputs, runId, parentRunId, tags, metadata, runType, name) {
        const run = this.runMap.get(runId) ??
            this._createRunForChainStart(chain, inputs, runId, parentRunId, tags, metadata, runType, name);
        await this.onRunCreate?.(run);
        await this.onChainStart?.(run);
        return run;
    }
    async handleChainEnd(outputs, runId, _parentRunId, _tags, kwargs) {
        const run = this.runMap.get(runId);
        if (!run) {
            throw new Error("No chain run to end.");
        }
        run.end_time = Date.now();
        run.outputs = _coerceToDict(outputs, "output");
        run.events.push({
            name: "end",
            time: new Date(run.end_time).toISOString(),
        });
        if (kwargs?.inputs !== undefined) {
            run.inputs = _coerceToDict(kwargs.inputs, "input");
        }
        await this.onChainEnd?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleChainError(error, runId, _parentRunId, _tags, kwargs) {
        const run = this.runMap.get(runId);
        if (!run) {
            throw new Error("No chain run to end.");
        }
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
            name: "error",
            time: new Date(run.end_time).toISOString(),
        });
        if (kwargs?.inputs !== undefined) {
            run.inputs = _coerceToDict(kwargs.inputs, "input");
        }
        await this.onChainError?.(run);
        await this._endTrace(run);
        return run;
    }
    /**
     * Create and add a run to the run map for tool start events.
     * This must sometimes be done synchronously to avoid race conditions
     * when callbacks are backgrounded, so we expose it as a separate method here.
     */
    _createRunForToolStart(tool, input, runId, parentRunId, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
            id: runId,
            name: name ?? tool.id[tool.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: tool,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString(),
                },
            ],
            inputs: { input },
            execution_order,
            child_execution_order: execution_order,
            run_type: "tool",
            child_runs: [],
            extra: metadata ? { metadata } : {},
            tags: tags || [],
        };
        return this._addRunToRunMap(run);
    }
    async handleToolStart(tool, input, runId, parentRunId, tags, metadata, name) {
        const run = this.runMap.get(runId) ??
            this._createRunForToolStart(tool, input, runId, parentRunId, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onToolStart?.(run);
        return run;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handleToolEnd(output, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "tool") {
            throw new Error("No tool run to end");
        }
        run.end_time = Date.now();
        run.outputs = { output };
        run.events.push({
            name: "end",
            time: new Date(run.end_time).toISOString(),
        });
        await this.onToolEnd?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleToolError(error, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "tool") {
            throw new Error("No tool run to end");
        }
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
            name: "error",
            time: new Date(run.end_time).toISOString(),
        });
        await this.onToolError?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleAgentAction(action, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "chain") {
            return;
        }
        const agentRun = run;
        agentRun.actions = agentRun.actions || [];
        agentRun.actions.push(action);
        agentRun.events.push({
            name: "agent_action",
            time: new Date().toISOString(),
            kwargs: { action },
        });
        await this.onAgentAction?.(run);
    }
    async handleAgentEnd(action, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "chain") {
            return;
        }
        run.events.push({
            name: "agent_end",
            time: new Date().toISOString(),
            kwargs: { action },
        });
        await this.onAgentEnd?.(run);
    }
    /**
     * Create and add a run to the run map for retriever start events.
     * This must sometimes be done synchronously to avoid race conditions
     * when callbacks are backgrounded, so we expose it as a separate method here.
     */
    _createRunForRetrieverStart(retriever, query, runId, parentRunId, tags, metadata, name) {
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
            id: runId,
            name: name ?? retriever.id[retriever.id.length - 1],
            parent_run_id: parentRunId,
            start_time,
            serialized: retriever,
            events: [
                {
                    name: "start",
                    time: new Date(start_time).toISOString(),
                },
            ],
            inputs: { query },
            execution_order,
            child_execution_order: execution_order,
            run_type: "retriever",
            child_runs: [],
            extra: metadata ? { metadata } : {},
            tags: tags || [],
        };
        return this._addRunToRunMap(run);
    }
    async handleRetrieverStart(retriever, query, runId, parentRunId, tags, metadata, name) {
        const run = this.runMap.get(runId) ??
            this._createRunForRetrieverStart(retriever, query, runId, parentRunId, tags, metadata, name);
        await this.onRunCreate?.(run);
        await this.onRetrieverStart?.(run);
        return run;
    }
    async handleRetrieverEnd(documents, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "retriever") {
            throw new Error("No retriever run to end");
        }
        run.end_time = Date.now();
        run.outputs = { documents };
        run.events.push({
            name: "end",
            time: new Date(run.end_time).toISOString(),
        });
        await this.onRetrieverEnd?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleRetrieverError(error, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "retriever") {
            throw new Error("No retriever run to end");
        }
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
            name: "error",
            time: new Date(run.end_time).toISOString(),
        });
        await this.onRetrieverError?.(run);
        await this._endTrace(run);
        return run;
    }
    async handleText(text, runId) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "chain") {
            return;
        }
        run.events.push({
            name: "text",
            time: new Date().toISOString(),
            kwargs: { text },
        });
        await this.onText?.(run);
    }
    async handleLLMNewToken(token, idx, runId, _parentRunId, _tags, fields) {
        const run = this.runMap.get(runId);
        if (!run || run?.run_type !== "llm") {
            throw new Error(`Invalid "runId" provided to "handleLLMNewToken" callback.`);
        }
        run.events.push({
            name: "new_token",
            time: new Date().toISOString(),
            kwargs: { token, idx, chunk: fields?.chunk },
        });
        await this.onLLMNewToken?.(run, token, { chunk: fields?.chunk });
        return run;
    }
}
