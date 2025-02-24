"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isToolMessageChunk = exports.isToolMessage = exports.defaultToolCallParser = exports.ToolMessageChunk = exports.ToolMessage = exports.isDirectToolOutput = void 0;
const base_js_1 = require("./base.cjs");
function isDirectToolOutput(x) {
    return (x != null &&
        typeof x === "object" &&
        "lc_direct_tool_output" in x &&
        x.lc_direct_tool_output === true);
}
exports.isDirectToolOutput = isDirectToolOutput;
/**
 * Represents a tool message in a conversation.
 */
class ToolMessage extends base_js_1.BaseMessage {
    static lc_name() {
        return "ToolMessage";
    }
    get lc_aliases() {
        // exclude snake case conversion to pascal case
        return { tool_call_id: "tool_call_id" };
    }
    constructor(fields, tool_call_id, name) {
        if (typeof fields === "string") {
            // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-non-null-assertion
            fields = { content: fields, name, tool_call_id: tool_call_id };
        }
        super(fields);
        Object.defineProperty(this, "lc_direct_tool_output", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        /**
         * Status of the tool invocation.
         * @version 0.2.19
         */
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tool_call_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Artifact of the Tool execution which is not meant to be sent to the model.
         *
         * Should only be specified if it is different from the message content, e.g. if only
         * a subset of the full tool output is being passed as message content but the full
         * output is needed in other parts of the code.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.defineProperty(this, "artifact", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.tool_call_id = fields.tool_call_id;
        this.artifact = fields.artifact;
        this.status = fields.status;
    }
    _getType() {
        return "tool";
    }
    static isInstance(message) {
        return message._getType() === "tool";
    }
    get _printableFields() {
        return {
            ...super._printableFields,
            tool_call_id: this.tool_call_id,
            artifact: this.artifact,
        };
    }
}
exports.ToolMessage = ToolMessage;
/**
 * Represents a chunk of a tool message, which can be concatenated
 * with other tool message chunks.
 */
class ToolMessageChunk extends base_js_1.BaseMessageChunk {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "tool_call_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Status of the tool invocation.
         * @version 0.2.19
         */
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Artifact of the Tool execution which is not meant to be sent to the model.
         *
         * Should only be specified if it is different from the message content, e.g. if only
         * a subset of the full tool output is being passed as message content but the full
         * output is needed in other parts of the code.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.defineProperty(this, "artifact", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.tool_call_id = fields.tool_call_id;
        this.artifact = fields.artifact;
        this.status = fields.status;
    }
    static lc_name() {
        return "ToolMessageChunk";
    }
    _getType() {
        return "tool";
    }
    concat(chunk) {
        return new ToolMessageChunk({
            content: (0, base_js_1.mergeContent)(this.content, chunk.content),
            additional_kwargs: (0, base_js_1._mergeDicts)(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: (0, base_js_1._mergeDicts)(this.response_metadata, chunk.response_metadata),
            artifact: (0, base_js_1._mergeObj)(this.artifact, chunk.artifact),
            tool_call_id: this.tool_call_id,
            id: this.id ?? chunk.id,
            status: (0, base_js_1._mergeStatus)(this.status, chunk.status),
        });
    }
    get _printableFields() {
        return {
            ...super._printableFields,
            tool_call_id: this.tool_call_id,
            artifact: this.artifact,
        };
    }
}
exports.ToolMessageChunk = ToolMessageChunk;
function defaultToolCallParser(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
rawToolCalls) {
    const toolCalls = [];
    const invalidToolCalls = [];
    for (const toolCall of rawToolCalls) {
        if (!toolCall.function) {
            continue;
        }
        else {
            const functionName = toolCall.function.name;
            try {
                const functionArgs = JSON.parse(toolCall.function.arguments);
                const parsed = {
                    name: functionName || "",
                    args: functionArgs || {},
                    id: toolCall.id,
                };
                toolCalls.push(parsed);
            }
            catch (error) {
                invalidToolCalls.push({
                    name: functionName,
                    args: toolCall.function.arguments,
                    id: toolCall.id,
                    error: "Malformed args.",
                });
            }
        }
    }
    return [toolCalls, invalidToolCalls];
}
exports.defaultToolCallParser = defaultToolCallParser;
function isToolMessage(x) {
    return x._getType() === "tool";
}
exports.isToolMessage = isToolMessage;
function isToolMessageChunk(x) {
    return x._getType() === "tool";
}
exports.isToolMessageChunk = isToolMessageChunk;
