"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStreamCallbackHandler = exports.isStreamEventsHandler = void 0;
const base_js_1 = require("./base.cjs");
const stream_js_1 = require("../utils/stream.cjs");
const ai_js_1 = require("../messages/ai.cjs");
const outputs_js_1 = require("../outputs.cjs");
function assignName({ name, serialized, }) {
    if (name !== undefined) {
        return name;
    }
    if (serialized?.name !== undefined) {
        return serialized.name;
    }
    else if (serialized?.id !== undefined && Array.isArray(serialized?.id)) {
        return serialized.id[serialized.id.length - 1];
    }
    return "Unnamed";
}
const isStreamEventsHandler = (handler) => handler.name === "event_stream_tracer";
exports.isStreamEventsHandler = isStreamEventsHandler;
/**
 * Class that extends the `BaseTracer` class from the
 * `langchain.callbacks.tracers.base` module. It represents a callback
 * handler that logs the execution of runs and emits `RunLog` instances to a
 * `RunLogStream`.
 */
class EventStreamCallbackHandler extends base_js_1.BaseTracer {
    constructor(fields) {
        super({ _awaitHandler: true, ...fields });
        Object.defineProperty(this, "autoClose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "includeNames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "includeTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "includeTags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "excludeNames", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "excludeTypes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "excludeTags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "runInfoMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "tappedPromises", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "transformStream", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "writer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "receiveStream", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "event_stream_tracer"
        });
        Object.defineProperty(this, "lc_prefer_streaming", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this.autoClose = fields?.autoClose ?? true;
        this.includeNames = fields?.includeNames;
        this.includeTypes = fields?.includeTypes;
        this.includeTags = fields?.includeTags;
        this.excludeNames = fields?.excludeNames;
        this.excludeTypes = fields?.excludeTypes;
        this.excludeTags = fields?.excludeTags;
        this.transformStream = new TransformStream();
        this.writer = this.transformStream.writable.getWriter();
        this.receiveStream = stream_js_1.IterableReadableStream.fromReadableStream(this.transformStream.readable);
    }
    [Symbol.asyncIterator]() {
        return this.receiveStream;
    }
    async persistRun(_run) {
        // This is a legacy method only called once for an entire run tree
        // and is therefore not useful here
    }
    _includeRun(run) {
        const runTags = run.tags ?? [];
        let include = this.includeNames === undefined &&
            this.includeTags === undefined &&
            this.includeTypes === undefined;
        if (this.includeNames !== undefined) {
            include = include || this.includeNames.includes(run.name);
        }
        if (this.includeTypes !== undefined) {
            include = include || this.includeTypes.includes(run.runType);
        }
        if (this.includeTags !== undefined) {
            include =
                include ||
                    runTags.find((tag) => this.includeTags?.includes(tag)) !== undefined;
        }
        if (this.excludeNames !== undefined) {
            include = include && !this.excludeNames.includes(run.name);
        }
        if (this.excludeTypes !== undefined) {
            include = include && !this.excludeTypes.includes(run.runType);
        }
        if (this.excludeTags !== undefined) {
            include =
                include && runTags.every((tag) => !this.excludeTags?.includes(tag));
        }
        return include;
    }
    async *tapOutputIterable(runId, outputStream) {
        const firstChunk = await outputStream.next();
        if (firstChunk.done) {
            return;
        }
        const runInfo = this.runInfoMap.get(runId);
        // Run has finished, don't issue any stream events.
        // An example of this is for runnables that use the default
        // implementation of .stream(), which delegates to .invoke()
        // and calls .onChainEnd() before passing it to the iterator.
        if (runInfo === undefined) {
            yield firstChunk.value;
            return;
        }
        // Match format from handlers below
        function _formatOutputChunk(eventType, data) {
            if (eventType === "llm" && typeof data === "string") {
                return new outputs_js_1.GenerationChunk({ text: data });
            }
            return data;
        }
        let tappedPromise = this.tappedPromises.get(runId);
        // if we are the first to tap, issue stream events
        if (tappedPromise === undefined) {
            let tappedPromiseResolver;
            tappedPromise = new Promise((resolve) => {
                tappedPromiseResolver = resolve;
            });
            this.tappedPromises.set(runId, tappedPromise);
            try {
                const event = {
                    event: `on_${runInfo.runType}_stream`,
                    run_id: runId,
                    name: runInfo.name,
                    tags: runInfo.tags,
                    metadata: runInfo.metadata,
                    data: {},
                };
                await this.send({
                    ...event,
                    data: {
                        chunk: _formatOutputChunk(runInfo.runType, firstChunk.value),
                    },
                }, runInfo);
                yield firstChunk.value;
                for await (const chunk of outputStream) {
                    // Don't yield tool and retriever stream events
                    if (runInfo.runType !== "tool" && runInfo.runType !== "retriever") {
                        await this.send({
                            ...event,
                            data: {
                                chunk: _formatOutputChunk(runInfo.runType, chunk),
                            },
                        }, runInfo);
                    }
                    yield chunk;
                }
            }
            finally {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                tappedPromiseResolver();
                // Don't delete from the promises map to keep track of which runs have been tapped.
            }
        }
        else {
            // otherwise just pass through
            yield firstChunk.value;
            for await (const chunk of outputStream) {
                yield chunk;
            }
        }
    }
    async send(payload, run) {
        if (this._includeRun(run)) {
            await this.writer.write(payload);
        }
    }
    async sendEndEvent(payload, run) {
        const tappedPromise = this.tappedPromises.get(payload.run_id);
        if (tappedPromise !== undefined) {
            void tappedPromise.then(() => {
                void this.send(payload, run);
            });
        }
        else {
            await this.send(payload, run);
        }
    }
    async onLLMStart(run) {
        const runName = assignName(run);
        const runType = run.inputs.messages !== undefined ? "chat_model" : "llm";
        const runInfo = {
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
            name: runName,
            runType,
            inputs: run.inputs,
        };
        this.runInfoMap.set(run.id, runInfo);
        const eventName = `on_${runType}_start`;
        await this.send({
            event: eventName,
            data: {
                input: run.inputs,
            },
            name: runName,
            tags: run.tags ?? [],
            run_id: run.id,
            metadata: run.extra?.metadata ?? {},
        }, runInfo);
    }
    async onLLMNewToken(run, token, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kwargs) {
        const runInfo = this.runInfoMap.get(run.id);
        let chunk;
        let eventName;
        if (runInfo === undefined) {
            throw new Error(`onLLMNewToken: Run ID ${run.id} not found in run map.`);
        }
        // Top-level streaming events are covered by tapOutputIterable
        if (this.runInfoMap.size === 1) {
            return;
        }
        if (runInfo.runType === "chat_model") {
            eventName = "on_chat_model_stream";
            if (kwargs?.chunk === undefined) {
                chunk = new ai_js_1.AIMessageChunk({ content: token, id: `run-${run.id}` });
            }
            else {
                chunk = kwargs.chunk.message;
            }
        }
        else if (runInfo.runType === "llm") {
            eventName = "on_llm_stream";
            if (kwargs?.chunk === undefined) {
                chunk = new outputs_js_1.GenerationChunk({ text: token });
            }
            else {
                chunk = kwargs.chunk;
            }
        }
        else {
            throw new Error(`Unexpected run type ${runInfo.runType}`);
        }
        await this.send({
            event: eventName,
            data: {
                chunk,
            },
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata,
        }, runInfo);
    }
    async onLLMEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        let eventName;
        if (runInfo === undefined) {
            throw new Error(`onLLMEnd: Run ID ${run.id} not found in run map.`);
        }
        const generations = run.outputs?.generations;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let output;
        if (runInfo.runType === "chat_model") {
            for (const generation of generations ?? []) {
                if (output !== undefined) {
                    break;
                }
                output = generation[0]?.message;
            }
            eventName = "on_chat_model_end";
        }
        else if (runInfo.runType === "llm") {
            output = {
                generations: generations?.map((generation) => {
                    return generation.map((chunk) => {
                        return {
                            text: chunk.text,
                            generationInfo: chunk.generationInfo,
                        };
                    });
                }),
                llmOutput: run.outputs?.llmOutput ?? {},
            };
            eventName = "on_llm_end";
        }
        else {
            throw new Error(`onLLMEnd: Unexpected run type: ${runInfo.runType}`);
        }
        await this.sendEndEvent({
            event: eventName,
            data: {
                output,
                input: runInfo.inputs,
            },
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata,
        }, runInfo);
    }
    async onChainStart(run) {
        const runName = assignName(run);
        const runType = run.run_type ?? "chain";
        const runInfo = {
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
            name: runName,
            runType: run.run_type,
        };
        let eventData = {};
        // Workaround Runnable core code not sending input when transform streaming.
        if (run.inputs.input === "" && Object.keys(run.inputs).length === 1) {
            eventData = {};
            runInfo.inputs = {};
        }
        else if (run.inputs.input !== undefined) {
            eventData.input = run.inputs.input;
            runInfo.inputs = run.inputs.input;
        }
        else {
            eventData.input = run.inputs;
            runInfo.inputs = run.inputs;
        }
        this.runInfoMap.set(run.id, runInfo);
        await this.send({
            event: `on_${runType}_start`,
            data: eventData,
            name: runName,
            tags: run.tags ?? [],
            run_id: run.id,
            metadata: run.extra?.metadata ?? {},
        }, runInfo);
    }
    async onChainEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        if (runInfo === undefined) {
            throw new Error(`onChainEnd: Run ID ${run.id} not found in run map.`);
        }
        const eventName = `on_${run.run_type}_end`;
        const inputs = run.inputs ?? runInfo.inputs ?? {};
        const outputs = run.outputs?.output ?? run.outputs;
        const data = {
            output: outputs,
            input: inputs,
        };
        if (inputs.input && Object.keys(inputs).length === 1) {
            data.input = inputs.input;
            runInfo.inputs = inputs.input;
        }
        await this.sendEndEvent({
            event: eventName,
            data,
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata ?? {},
        }, runInfo);
    }
    async onToolStart(run) {
        const runName = assignName(run);
        const runInfo = {
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
            name: runName,
            runType: "tool",
            inputs: run.inputs ?? {},
        };
        this.runInfoMap.set(run.id, runInfo);
        await this.send({
            event: "on_tool_start",
            data: {
                input: run.inputs ?? {},
            },
            name: runName,
            run_id: run.id,
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
        }, runInfo);
    }
    async onToolEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        if (runInfo === undefined) {
            throw new Error(`onToolEnd: Run ID ${run.id} not found in run map.`);
        }
        if (runInfo.inputs === undefined) {
            throw new Error(`onToolEnd: Run ID ${run.id} is a tool call, and is expected to have traced inputs.`);
        }
        const output = run.outputs?.output === undefined ? run.outputs : run.outputs.output;
        await this.sendEndEvent({
            event: "on_tool_end",
            data: {
                output,
                input: runInfo.inputs,
            },
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata,
        }, runInfo);
    }
    async onRetrieverStart(run) {
        const runName = assignName(run);
        const runType = "retriever";
        const runInfo = {
            tags: run.tags ?? [],
            metadata: run.extra?.metadata ?? {},
            name: runName,
            runType,
            inputs: {
                query: run.inputs.query,
            },
        };
        this.runInfoMap.set(run.id, runInfo);
        await this.send({
            event: "on_retriever_start",
            data: {
                input: {
                    query: run.inputs.query,
                },
            },
            name: runName,
            tags: run.tags ?? [],
            run_id: run.id,
            metadata: run.extra?.metadata ?? {},
        }, runInfo);
    }
    async onRetrieverEnd(run) {
        const runInfo = this.runInfoMap.get(run.id);
        this.runInfoMap.delete(run.id);
        if (runInfo === undefined) {
            throw new Error(`onRetrieverEnd: Run ID ${run.id} not found in run map.`);
        }
        await this.sendEndEvent({
            event: "on_retriever_end",
            data: {
                output: run.outputs?.documents ?? run.outputs,
                input: runInfo.inputs,
            },
            run_id: run.id,
            name: runInfo.name,
            tags: runInfo.tags,
            metadata: runInfo.metadata,
        }, runInfo);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handleCustomEvent(eventName, data, runId) {
        const runInfo = this.runInfoMap.get(runId);
        if (runInfo === undefined) {
            throw new Error(`handleCustomEvent: Run ID ${runId} not found in run map.`);
        }
        await this.send({
            event: "on_custom_event",
            run_id: runId,
            name: eventName,
            tags: runInfo.tags,
            metadata: runInfo.metadata,
            data,
        }, runInfo);
    }
    async finish() {
        const pendingPromises = [...this.tappedPromises.values()];
        void Promise.all(pendingPromises).finally(() => {
            void this.writer.close();
        });
    }
}
exports.EventStreamCallbackHandler = EventStreamCallbackHandler;
