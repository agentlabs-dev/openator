import { parsePartialJson } from "../utils/json.js";
import { BaseMessage, BaseMessageChunk, mergeContent, _mergeDicts, _mergeLists, } from "./base.js";
import { defaultToolCallParser, } from "./tool.js";
/**
 * Represents an AI message in a conversation.
 */
export class AIMessage extends BaseMessage {
    get lc_aliases() {
        // exclude snake case conversion to pascal case
        return {
            ...super.lc_aliases,
            tool_calls: "tool_calls",
            invalid_tool_calls: "invalid_tool_calls",
        };
    }
    constructor(fields, 
    /** @deprecated */
    kwargs) {
        let initParams;
        if (typeof fields === "string") {
            initParams = {
                content: fields,
                tool_calls: [],
                invalid_tool_calls: [],
                additional_kwargs: kwargs ?? {},
            };
        }
        else {
            initParams = fields;
            const rawToolCalls = initParams.additional_kwargs?.tool_calls;
            const toolCalls = initParams.tool_calls;
            if (!(rawToolCalls == null) &&
                rawToolCalls.length > 0 &&
                (toolCalls === undefined || toolCalls.length === 0)) {
                console.warn([
                    "New LangChain packages are available that more efficiently handle",
                    "tool calling.\n\nPlease upgrade your packages to versions that set",
                    "message tool calls. e.g., `yarn add @langchain/anthropic`,",
                    "yarn add @langchain/openai`, etc.",
                ].join(" "));
            }
            try {
                if (!(rawToolCalls == null) && toolCalls === undefined) {
                    const [toolCalls, invalidToolCalls] = defaultToolCallParser(rawToolCalls);
                    initParams.tool_calls = toolCalls ?? [];
                    initParams.invalid_tool_calls = invalidToolCalls ?? [];
                }
                else {
                    initParams.tool_calls = initParams.tool_calls ?? [];
                    initParams.invalid_tool_calls = initParams.invalid_tool_calls ?? [];
                }
            }
            catch (e) {
                // Do nothing if parsing fails
                initParams.tool_calls = [];
                initParams.invalid_tool_calls = [];
            }
        }
        // Sadly, TypeScript only allows super() calls at root if the class has
        // properties with initializers, so we have to check types twice.
        super(initParams);
        // These are typed as optional to avoid breaking changes and allow for casting
        // from BaseMessage.
        Object.defineProperty(this, "tool_calls", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "invalid_tool_calls", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        /**
         * If provided, token usage information associated with the message.
         */
        Object.defineProperty(this, "usage_metadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (typeof initParams !== "string") {
            this.tool_calls = initParams.tool_calls ?? this.tool_calls;
            this.invalid_tool_calls =
                initParams.invalid_tool_calls ?? this.invalid_tool_calls;
        }
        this.usage_metadata = initParams.usage_metadata;
    }
    static lc_name() {
        return "AIMessage";
    }
    _getType() {
        return "ai";
    }
    get _printableFields() {
        return {
            ...super._printableFields,
            tool_calls: this.tool_calls,
            invalid_tool_calls: this.invalid_tool_calls,
            usage_metadata: this.usage_metadata,
        };
    }
}
export function isAIMessage(x) {
    return x._getType() === "ai";
}
export function isAIMessageChunk(x) {
    return x._getType() === "ai";
}
/**
 * Represents a chunk of an AI message, which can be concatenated with
 * other AI message chunks.
 */
export class AIMessageChunk extends BaseMessageChunk {
    constructor(fields) {
        let initParams;
        if (typeof fields === "string") {
            initParams = {
                content: fields,
                tool_calls: [],
                invalid_tool_calls: [],
                tool_call_chunks: [],
            };
        }
        else if (fields.tool_call_chunks === undefined) {
            initParams = {
                ...fields,
                tool_calls: fields.tool_calls ?? [],
                invalid_tool_calls: [],
                tool_call_chunks: [],
                usage_metadata: fields.usage_metadata !== undefined
                    ? fields.usage_metadata
                    : undefined,
            };
        }
        else {
            const toolCalls = [];
            const invalidToolCalls = [];
            for (const toolCallChunk of fields.tool_call_chunks) {
                let parsedArgs = {};
                try {
                    parsedArgs = parsePartialJson(toolCallChunk.args || "{}");
                    if (parsedArgs === null ||
                        typeof parsedArgs !== "object" ||
                        Array.isArray(parsedArgs)) {
                        throw new Error("Malformed tool call chunk args.");
                    }
                    toolCalls.push({
                        name: toolCallChunk.name ?? "",
                        args: parsedArgs,
                        id: toolCallChunk.id,
                        type: "tool_call",
                    });
                }
                catch (e) {
                    invalidToolCalls.push({
                        name: toolCallChunk.name,
                        args: toolCallChunk.args,
                        id: toolCallChunk.id,
                        error: "Malformed args.",
                        type: "invalid_tool_call",
                    });
                }
            }
            initParams = {
                ...fields,
                tool_calls: toolCalls,
                invalid_tool_calls: invalidToolCalls,
                usage_metadata: fields.usage_metadata !== undefined
                    ? fields.usage_metadata
                    : undefined,
            };
        }
        // Sadly, TypeScript only allows super() calls at root if the class has
        // properties with initializers, so we have to check types twice.
        super(initParams);
        // Must redeclare tool call fields since there is no multiple inheritance in JS.
        // These are typed as optional to avoid breaking changes and allow for casting
        // from BaseMessage.
        Object.defineProperty(this, "tool_calls", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "invalid_tool_calls", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "tool_call_chunks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        /**
         * If provided, token usage information associated with the message.
         */
        Object.defineProperty(this, "usage_metadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.tool_call_chunks =
            initParams.tool_call_chunks ?? this.tool_call_chunks;
        this.tool_calls = initParams.tool_calls ?? this.tool_calls;
        this.invalid_tool_calls =
            initParams.invalid_tool_calls ?? this.invalid_tool_calls;
        this.usage_metadata = initParams.usage_metadata;
    }
    get lc_aliases() {
        // exclude snake case conversion to pascal case
        return {
            ...super.lc_aliases,
            tool_calls: "tool_calls",
            invalid_tool_calls: "invalid_tool_calls",
            tool_call_chunks: "tool_call_chunks",
        };
    }
    static lc_name() {
        return "AIMessageChunk";
    }
    _getType() {
        return "ai";
    }
    get _printableFields() {
        return {
            ...super._printableFields,
            tool_calls: this.tool_calls,
            tool_call_chunks: this.tool_call_chunks,
            invalid_tool_calls: this.invalid_tool_calls,
            usage_metadata: this.usage_metadata,
        };
    }
    concat(chunk) {
        const combinedFields = {
            content: mergeContent(this.content, chunk.content),
            additional_kwargs: _mergeDicts(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: _mergeDicts(this.response_metadata, chunk.response_metadata),
            tool_call_chunks: [],
            id: this.id ?? chunk.id,
        };
        if (this.tool_call_chunks !== undefined ||
            chunk.tool_call_chunks !== undefined) {
            const rawToolCalls = _mergeLists(this.tool_call_chunks, chunk.tool_call_chunks);
            if (rawToolCalls !== undefined && rawToolCalls.length > 0) {
                combinedFields.tool_call_chunks = rawToolCalls;
            }
        }
        if (this.usage_metadata !== undefined ||
            chunk.usage_metadata !== undefined) {
            const inputTokenDetails = {
                ...((this.usage_metadata?.input_token_details?.audio !== undefined ||
                    chunk.usage_metadata?.input_token_details?.audio !== undefined) && {
                    audio: (this.usage_metadata?.input_token_details?.audio ?? 0) +
                        (chunk.usage_metadata?.input_token_details?.audio ?? 0),
                }),
                ...((this.usage_metadata?.input_token_details?.cache_read !==
                    undefined ||
                    chunk.usage_metadata?.input_token_details?.cache_read !==
                        undefined) && {
                    cache_read: (this.usage_metadata?.input_token_details?.cache_read ?? 0) +
                        (chunk.usage_metadata?.input_token_details?.cache_read ?? 0),
                }),
                ...((this.usage_metadata?.input_token_details?.cache_creation !==
                    undefined ||
                    chunk.usage_metadata?.input_token_details?.cache_creation !==
                        undefined) && {
                    cache_creation: (this.usage_metadata?.input_token_details?.cache_creation ?? 0) +
                        (chunk.usage_metadata?.input_token_details?.cache_creation ?? 0),
                }),
            };
            const outputTokenDetails = {
                ...((this.usage_metadata?.output_token_details?.audio !== undefined ||
                    chunk.usage_metadata?.output_token_details?.audio !== undefined) && {
                    audio: (this.usage_metadata?.output_token_details?.audio ?? 0) +
                        (chunk.usage_metadata?.output_token_details?.audio ?? 0),
                }),
                ...((this.usage_metadata?.output_token_details?.reasoning !==
                    undefined ||
                    chunk.usage_metadata?.output_token_details?.reasoning !==
                        undefined) && {
                    reasoning: (this.usage_metadata?.output_token_details?.reasoning ?? 0) +
                        (chunk.usage_metadata?.output_token_details?.reasoning ?? 0),
                }),
            };
            const left = this.usage_metadata ?? {
                input_tokens: 0,
                output_tokens: 0,
                total_tokens: 0,
            };
            const right = chunk.usage_metadata ?? {
                input_tokens: 0,
                output_tokens: 0,
                total_tokens: 0,
            };
            const usage_metadata = {
                input_tokens: left.input_tokens + right.input_tokens,
                output_tokens: left.output_tokens + right.output_tokens,
                total_tokens: left.total_tokens + right.total_tokens,
                // Do not include `input_token_details` / `output_token_details` keys in combined fields
                // unless their values are defined.
                ...(Object.keys(inputTokenDetails).length > 0 && {
                    input_token_details: inputTokenDetails,
                }),
                ...(Object.keys(outputTokenDetails).length > 0 && {
                    output_token_details: outputTokenDetails,
                }),
            };
            combinedFields.usage_metadata = usage_metadata;
        }
        return new AIMessageChunk(combinedFields);
    }
}
