import { Client, RunTree } from "./index.js";
import { v5 as uuid5 } from "uuid";
import { getCurrentRunTree } from "./singletons/traceable.js";
import { getLangSmithEnvironmentVariable, getEnvironmentVariable, } from "./utils/env.js";
import { isTracingEnabled } from "./env.js";
// Attempt to convert CoreMessage to a LangChain-compatible format
// which allows us to render messages more nicely in LangSmith
function convertCoreToSmith(message) {
    if (message.role === "assistant") {
        const data = { content: message.content };
        if (Array.isArray(message.content)) {
            data.content = message.content.map((part) => {
                if (part.type === "text") {
                    return {
                        type: "text",
                        text: part.text,
                        ...part.experimental_providerMetadata,
                    };
                }
                if (part.type === "tool-call") {
                    return {
                        type: "tool_use",
                        name: part.toolName,
                        id: part.toolCallId,
                        input: part.args,
                        ...part.experimental_providerMetadata,
                    };
                }
                return part;
            });
            const toolCalls = message.content.filter((part) => part.type === "tool-call");
            if (toolCalls.length > 0) {
                data.additional_kwargs ??= {};
                data.additional_kwargs.tool_calls = toolCalls.map((part) => {
                    return {
                        id: part.toolCallId,
                        type: "function",
                        function: {
                            name: part.toolName,
                            id: part.toolCallId,
                            arguments: JSON.stringify(part.args),
                        },
                    };
                });
            }
        }
        return { type: "ai", data };
    }
    if (message.role === "user") {
        const data = { content: message.content };
        if (Array.isArray(message.content)) {
            data.content = message.content.map((part) => {
                if (part.type === "text") {
                    return {
                        type: "text",
                        text: part.text,
                        ...part.experimental_providerMetadata,
                    };
                }
                if (part.type === "image") {
                    return {
                        type: "image_url",
                        image_url: part.image,
                        ...part.experimental_providerMetadata,
                    };
                }
                return part;
            });
        }
        return { type: "human", data };
    }
    if (message.role === "system") {
        return { type: "system", data: { content: message.content } };
    }
    if (message.role === "tool") {
        const res = message.content.map((toolCall) => {
            return {
                type: "tool",
                data: {
                    content: JSON.stringify(toolCall.result),
                    name: toolCall.toolName,
                    tool_call_id: toolCall.toolCallId,
                },
            };
        });
        if (res.length === 1)
            return res[0];
        return res;
    }
    return message;
}
const tryJson = (str) => {
    try {
        if (!str)
            return str;
        if (typeof str !== "string")
            return str;
        return JSON.parse(str);
    }
    catch {
        return str;
    }
};
function stripNonAlphanumeric(input) {
    return input.replace(/[-:.]/g, "");
}
function getDotOrder(item) {
    const { startTime: [seconds, nanoseconds], id: runId, executionOrder, } = item;
    // Date only has millisecond precision, so we use the microseconds to break
    // possible ties, avoiding incorrect run order
    const nanosecondString = String(nanoseconds).padStart(9, "0");
    const msFull = Number(nanosecondString.slice(0, 6)) + executionOrder;
    const msString = String(msFull).padStart(6, "0");
    const ms = Number(msString.slice(0, -3));
    const ns = msString.slice(-3);
    return (stripNonAlphanumeric(`${new Date(seconds * 1000 + ms).toISOString().slice(0, -1)}${ns}Z`) + runId);
}
function joinDotOrder(...segments) {
    return segments.filter(Boolean).join(".");
}
function removeDotOrder(dotOrder, ...ids) {
    return dotOrder
        .split(".")
        .filter((i) => !ids.some((id) => i.includes(id)))
        .join(".");
}
function reparentDotOrder(dotOrder, sourceRunId, parentDotOrder) {
    const segments = dotOrder.split(".");
    const sourceIndex = segments.findIndex((i) => i.includes(sourceRunId));
    if (sourceIndex === -1)
        return dotOrder;
    return joinDotOrder(...parentDotOrder.split("."), ...segments.slice(sourceIndex));
}
function getMutableRunCreate(dotOrder) {
    const segments = dotOrder.split(".").map((i) => {
        const [startTime, runId] = i.split("Z");
        return { startTime, runId };
    });
    const traceId = segments[0].runId;
    const parentRunId = segments.at(-2)?.runId;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const runId = segments.at(-1).runId;
    return {
        id: runId,
        trace_id: traceId,
        dotted_order: dotOrder,
        parent_run_id: parentRunId,
    };
}
function convertToTimestamp([seconds, nanoseconds]) {
    const ms = String(nanoseconds).slice(0, 3);
    return Number(String(seconds) + ms);
}
function sortByHr(a, b) {
    if (a[0] !== b[0])
        return Math.sign(a[0] - b[0]);
    return Math.sign(a[1] - b[1]);
}
const ROOT = "$";
const RUN_ID_NAMESPACE = "5c718b20-9078-11ef-9a3d-325096b39f47";
const RUN_ID_METADATA_KEY = {
    input: "langsmith:runId",
    output: "ai.telemetry.metadata.langsmith:runId",
};
const RUN_NAME_METADATA_KEY = {
    input: "langsmith:runName",
    output: "ai.telemetry.metadata.langsmith:runName",
};
const TRACE_METADATA_KEY = {
    input: "langsmith:trace",
    output: "ai.telemetry.metadata.langsmith:trace",
};
const BAGGAGE_METADATA_KEY = {
    input: "langsmith:baggage",
    output: "ai.telemetry.metadata.langsmith:baggage",
};
const RESERVED_METADATA_KEYS = [
    RUN_ID_METADATA_KEY.output,
    RUN_NAME_METADATA_KEY.output,
    TRACE_METADATA_KEY.output,
    BAGGAGE_METADATA_KEY.output,
];
/**
 * OpenTelemetry trace exporter for Vercel AI SDK.
 *
 * @example
 * ```ts
 * import { AISDKExporter } from "langsmith/vercel";
 * import { Client } from "langsmith";
 *
 * import { generateText } from "ai";
 * import { openai } from "@ai-sdk/openai";
 *
 * import { NodeSDK } from "@opentelemetry/sdk-node";
 * import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
 *
 * const client = new Client();
 *
 * const sdk = new NodeSDK({
 *   traceExporter: new AISDKExporter({ client }),
 *   instrumentations: [getNodeAutoInstrumentations()],
 * });
 *
 * sdk.start();
 *
 * const res = await generateText({
 *   model: openai("gpt-4o-mini"),
 *   messages: [
 *     {
 *       role: "user",
 *       content: "What color is the sky?",
 *     },
 *   ],
 *   experimental_telemetry: AISDKExporter.getSettings({
 *     runName: "langsmith_traced_call",
 *     metadata: { userId: "123", language: "english" },
 *   }),
 * });
 *
 * await sdk.shutdown();
 * ```
 */
export class AISDKExporter {
    constructor(args) {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "traceByMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "debug", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** @internal */
        Object.defineProperty(this, "getSpanAttributeKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (span, key) => {
                const attributes = span.attributes;
                return key in attributes && typeof attributes[key] === "string"
                    ? attributes[key]
                    : undefined;
            }
        });
        this.client = args?.client ?? new Client();
        this.debug =
            args?.debug ?? getEnvironmentVariable("OTEL_LOG_LEVEL") === "DEBUG";
        this.logDebug("creating exporter", { tracingEnabled: isTracingEnabled() });
    }
    static getSettings(settings) {
        const { runId, runName, ...rest } = settings ?? {};
        const metadata = { ...rest?.metadata };
        if (runId != null)
            metadata[RUN_ID_METADATA_KEY.input] = runId;
        if (runName != null)
            metadata[RUN_NAME_METADATA_KEY.input] = runName;
        // attempt to obtain the run tree if used within a traceable function
        let defaultEnabled = settings?.isEnabled ?? isTracingEnabled();
        try {
            const runTree = getCurrentRunTree();
            const headers = runTree.toHeaders();
            metadata[TRACE_METADATA_KEY.input] = headers["langsmith-trace"];
            metadata[BAGGAGE_METADATA_KEY.input] = headers["baggage"];
            // honor the tracingEnabled flag if coming from traceable
            if (runTree.tracingEnabled != null) {
                defaultEnabled = runTree.tracingEnabled;
            }
        }
        catch {
            // pass
        }
        if (metadata[RUN_ID_METADATA_KEY.input] &&
            metadata[TRACE_METADATA_KEY.input]) {
            throw new Error("Cannot provide `runId` when used within traceable function.");
        }
        return { ...rest, isEnabled: rest.isEnabled ?? defaultEnabled, metadata };
    }
    /** @internal */
    parseInteropFromMetadata(span) {
        if (!this.isRootRun(span))
            return undefined;
        const userTraceId = this.getSpanAttributeKey(span, RUN_ID_METADATA_KEY.output);
        const parentTrace = this.getSpanAttributeKey(span, TRACE_METADATA_KEY.output);
        if (parentTrace && userTraceId) {
            throw new Error(`Cannot provide both "${RUN_ID_METADATA_KEY.input}" and "${TRACE_METADATA_KEY.input}" metadata keys.`);
        }
        if (parentTrace) {
            const parentRunTree = RunTree.fromHeaders({
                "langsmith-trace": parentTrace,
                baggage: this.getSpanAttributeKey(span, BAGGAGE_METADATA_KEY.output) || "",
            });
            if (!parentRunTree)
                throw new Error("Unreachable code: empty parent run tree");
            return { type: "traceable", parentRunTree };
        }
        if (userTraceId)
            return { type: "user", userRunId: userTraceId };
        return undefined;
    }
    /** @internal */
    getRunCreate(span) {
        const asRunCreate = (rawConfig) => {
            const aiMetadata = Object.keys(span.attributes)
                .filter((key) => key.startsWith("ai.telemetry.metadata.") &&
                !RESERVED_METADATA_KEYS.includes(key))
                .reduce((acc, key) => {
                acc[key.slice("ai.telemetry.metadata.".length)] =
                    span.attributes[key];
                return acc;
            }, {});
            if (("ai.telemetry.functionId" in span.attributes &&
                span.attributes["ai.telemetry.functionId"]) ||
                ("resource.name" in span.attributes && span.attributes["resource.name"])) {
                aiMetadata["functionId"] =
                    span.attributes["ai.telemetry.functionId"] ||
                        span.attributes["resource.name"];
            }
            const parsedStart = convertToTimestamp(span.startTime);
            const parsedEnd = convertToTimestamp(span.endTime);
            let name = rawConfig.name;
            // if user provided a custom name, only use it if it's the root
            if (this.isRootRun(span)) {
                name =
                    this.getSpanAttributeKey(span, RUN_NAME_METADATA_KEY.output) || name;
            }
            const config = {
                ...rawConfig,
                name,
                extra: {
                    ...rawConfig.extra,
                    metadata: {
                        ...rawConfig.extra?.metadata,
                        ...aiMetadata,
                        "ai.operationId": span.attributes["ai.operationId"],
                    },
                },
                session_name: getLangSmithEnvironmentVariable("PROJECT") ??
                    getLangSmithEnvironmentVariable("SESSION"),
                start_time: Math.min(parsedStart, parsedEnd),
                end_time: Math.max(parsedStart, parsedEnd),
            };
            return config;
        };
        switch (span.name) {
            case "ai.generateText.doGenerate":
            case "ai.generateText":
            case "ai.streamText.doStream":
            case "ai.streamText": {
                const inputs = (() => {
                    if ("ai.prompt.messages" in span.attributes) {
                        return {
                            messages: tryJson(span.attributes["ai.prompt.messages"]).flatMap((i) => convertCoreToSmith(i)),
                        };
                    }
                    if ("ai.prompt" in span.attributes) {
                        const input = tryJson(span.attributes["ai.prompt"]);
                        if (typeof input === "object" &&
                            input != null &&
                            "messages" in input &&
                            Array.isArray(input.messages)) {
                            return {
                                messages: input.messages.flatMap((i) => convertCoreToSmith(i)),
                            };
                        }
                        return { input };
                    }
                    return {};
                })();
                const outputs = (() => {
                    let result = undefined;
                    if (span.attributes["ai.response.toolCalls"]) {
                        let content = tryJson(span.attributes["ai.response.toolCalls"]);
                        if (Array.isArray(content)) {
                            content = content.map((i) => ({
                                type: "tool-call",
                                ...i,
                                args: tryJson(i.args),
                            }));
                        }
                        result = {
                            llm_output: convertCoreToSmith({
                                role: "assistant",
                                content,
                            }),
                        };
                    }
                    else if (span.attributes["ai.response.text"]) {
                        result = {
                            llm_output: convertCoreToSmith({
                                role: "assistant",
                                content: span.attributes["ai.response.text"],
                            }),
                        };
                    }
                    if (span.attributes["ai.usage.completionTokens"]) {
                        result ??= {};
                        result.llm_output ??= {};
                        result.llm_output.token_usage ??= {};
                        result.llm_output.token_usage["completion_tokens"] =
                            span.attributes["ai.usage.completionTokens"];
                    }
                    if (span.attributes["ai.usage.promptTokens"]) {
                        result ??= {};
                        result.llm_output ??= {};
                        result.llm_output.token_usage ??= {};
                        result.llm_output.token_usage["prompt_tokens"] =
                            span.attributes["ai.usage.promptTokens"];
                    }
                    return result;
                })();
                const events = [];
                const firstChunkEvent = span.events.find((i) => i.name === "ai.stream.firstChunk");
                if (firstChunkEvent) {
                    events.push({
                        name: "new_token",
                        time: convertToTimestamp(firstChunkEvent.time),
                    });
                }
                // TODO: add first_token_time
                return asRunCreate({
                    run_type: "llm",
                    name: span.attributes["ai.model.provider"],
                    inputs,
                    outputs,
                    events,
                    extra: {
                        batch_size: 1,
                        metadata: {
                            ls_provider: span.attributes["ai.model.provider"]
                                .split(".")
                                .at(0),
                            ls_model_type: span.attributes["ai.model.provider"]
                                .split(".")
                                .at(1),
                            ls_model_name: span.attributes["ai.model.id"],
                        },
                    },
                });
            }
            case "ai.toolCall": {
                const args = tryJson(span.attributes["ai.toolCall.args"]);
                let inputs = { args };
                if (typeof args === "object" && args != null) {
                    inputs = args;
                }
                const output = tryJson(span.attributes["ai.toolCall.result"]);
                let outputs = { output };
                if (typeof output === "object" && output != null) {
                    outputs = output;
                }
                return asRunCreate({
                    run_type: "tool",
                    name: span.attributes["ai.toolCall.name"],
                    inputs,
                    outputs,
                });
            }
            case "ai.streamObject":
            case "ai.streamObject.doStream":
            case "ai.generateObject":
            case "ai.generateObject.doGenerate": {
                const inputs = (() => {
                    if ("ai.prompt.messages" in span.attributes) {
                        return {
                            messages: tryJson(span.attributes["ai.prompt.messages"]).flatMap((i) => convertCoreToSmith(i)),
                        };
                    }
                    if ("ai.prompt" in span.attributes) {
                        return { input: tryJson(span.attributes["ai.prompt"]) };
                    }
                    return {};
                })();
                const outputs = (() => {
                    let result = undefined;
                    if (span.attributes["ai.response.object"]) {
                        result = {
                            output: tryJson(span.attributes["ai.response.object"]),
                        };
                    }
                    if (span.attributes["ai.usage.completionTokens"]) {
                        result ??= {};
                        result.llm_output ??= {};
                        result.llm_output.token_usage ??= {};
                        result.llm_output.token_usage["completion_tokens"] =
                            span.attributes["ai.usage.completionTokens"];
                    }
                    if (span.attributes["ai.usage.promptTokens"]) {
                        result ??= {};
                        result.llm_output ??= {};
                        result.llm_output.token_usage ??= {};
                        result.llm_output.token_usage["prompt_tokens"] =
                            +span.attributes["ai.usage.promptTokens"];
                    }
                    return result;
                })();
                const events = [];
                const firstChunkEvent = span.events.find((i) => i.name === "ai.stream.firstChunk");
                if (firstChunkEvent) {
                    events.push({
                        name: "new_token",
                        time: convertToTimestamp(firstChunkEvent.time),
                    });
                }
                return asRunCreate({
                    run_type: "llm",
                    name: span.attributes["ai.model.provider"],
                    inputs,
                    outputs,
                    events,
                    extra: {
                        batch_size: 1,
                        metadata: {
                            ls_provider: span.attributes["ai.model.provider"]
                                .split(".")
                                .at(0),
                            ls_model_type: span.attributes["ai.model.provider"]
                                .split(".")
                                .at(1),
                            ls_model_name: span.attributes["ai.model.id"],
                        },
                    },
                });
            }
            case "ai.embed":
            case "ai.embed.doEmbed":
            case "ai.embedMany":
            case "ai.embedMany.doEmbed":
            default:
                return undefined;
        }
    }
    /** @internal */
    isRootRun(span) {
        switch (span.name) {
            case "ai.generateText":
            case "ai.streamText":
            case "ai.generateObject":
            case "ai.streamObject":
            case "ai.embed":
            case "ai.embedMany":
                return true;
            default:
                return false;
        }
    }
    export(spans, resultCallback) {
        this.logDebug("exporting spans", spans);
        const typedSpans = spans
            .slice()
            .sort((a, b) => sortByHr(a.startTime, b.startTime));
        for (const span of typedSpans) {
            const { traceId, spanId } = span.spanContext();
            const parentId = span.parentSpanId ?? undefined;
            this.traceByMap[traceId] ??= {
                childMap: {},
                nodeMap: {},
                relativeExecutionOrder: {},
            };
            const runId = uuid5(spanId, RUN_ID_NAMESPACE);
            const parentRunId = parentId
                ? uuid5(parentId, RUN_ID_NAMESPACE)
                : undefined;
            const traceMap = this.traceByMap[traceId];
            const run = this.getRunCreate(span);
            traceMap.relativeExecutionOrder[parentRunId ?? ROOT] ??= -1;
            traceMap.relativeExecutionOrder[parentRunId ?? ROOT] += 1;
            traceMap.nodeMap[runId] ??= {
                id: runId,
                startTime: span.startTime,
                run,
                sent: false,
                interop: this.parseInteropFromMetadata(span),
                executionOrder: traceMap.relativeExecutionOrder[parentRunId ?? ROOT],
            };
            if (this.debug)
                console.log(`[${span.name}] ${runId}`, run);
            traceMap.childMap[parentRunId ?? ROOT] ??= [];
            traceMap.childMap[parentRunId ?? ROOT].push(traceMap.nodeMap[runId]);
        }
        const sampled = [];
        const actions = [];
        for (const traceId of Object.keys(this.traceByMap)) {
            const traceMap = this.traceByMap[traceId];
            const queue = traceMap.childMap[ROOT]?.map((item) => ({
                item,
                dotOrder: getDotOrder(item),
            })) ?? [];
            const seen = new Set();
            while (queue.length) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const task = queue.shift();
                if (seen.has(task.item.id))
                    continue;
                if (!task.item.sent) {
                    if (task.item.run != null) {
                        if (task.item.interop?.type === "user") {
                            actions.push({
                                type: "rename",
                                sourceRunId: task.item.id,
                                targetRunId: task.item.interop.userRunId,
                            });
                        }
                        if (task.item.interop?.type === "traceable") {
                            actions.push({
                                type: "reparent",
                                runId: task.item.id,
                                parentDotOrder: task.item.interop.parentRunTree.dotted_order,
                            });
                        }
                        let dotOrder = task.dotOrder;
                        for (const action of actions) {
                            if (action.type === "delete") {
                                dotOrder = removeDotOrder(dotOrder, action.runId);
                            }
                            if (action.type === "reparent") {
                                dotOrder = reparentDotOrder(dotOrder, action.runId, action.parentDotOrder);
                            }
                            if (action.type === "rename") {
                                dotOrder = dotOrder.replace(action.sourceRunId, action.targetRunId);
                            }
                        }
                        sampled.push({
                            ...task.item.run,
                            ...getMutableRunCreate(dotOrder),
                        });
                    }
                    else {
                        actions.push({ type: "delete", runId: task.item.id });
                    }
                    task.item.sent = true;
                }
                const children = traceMap.childMap[task.item.id] ?? [];
                queue.push(...children.map((item) => ({
                    item,
                    dotOrder: joinDotOrder(task.dotOrder, getDotOrder(item)),
                })));
            }
        }
        this.logDebug(`sampled runs to be sent to LangSmith`, sampled);
        Promise.all(sampled.map((run) => this.client.createRun(run))).then(() => resultCallback({ code: 0 }), (error) => resultCallback({ code: 1, error }));
    }
    async shutdown() {
        // find nodes which are incomplete
        const incompleteNodes = Object.values(this.traceByMap).flatMap((trace) => Object.values(trace.nodeMap).filter((i) => !i.sent && i.run != null));
        this.logDebug("shutting down", { incompleteNodes });
        if (incompleteNodes.length > 0) {
            console.warn("Some incomplete nodes were found before shutdown and not sent to LangSmith.");
        }
        await this.client?.awaitPendingTraceBatches();
    }
    async forceFlush() {
        await this.client?.awaitPendingTraceBatches();
    }
    logDebug(...args) {
        if (!this.debug)
            return;
        console.debug(`[${new Date().toISOString()}] [LangSmith]`, ...args);
    }
}
