"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChatMessageChunk = exports.isChatMessage = exports.ChatMessageChunk = exports.ChatMessage = void 0;
const base_js_1 = require("./base.cjs");
/**
 * Represents a chat message in a conversation.
 */
class ChatMessage extends base_js_1.BaseMessage {
    static lc_name() {
        return "ChatMessage";
    }
    static _chatMessageClass() {
        return ChatMessage;
    }
    constructor(fields, role) {
        if (typeof fields === "string") {
            // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-non-null-assertion
            fields = { content: fields, role: role };
        }
        super(fields);
        Object.defineProperty(this, "role", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.role = fields.role;
    }
    _getType() {
        return "generic";
    }
    static isInstance(message) {
        return message._getType() === "generic";
    }
    get _printableFields() {
        return {
            ...super._printableFields,
            role: this.role,
        };
    }
}
exports.ChatMessage = ChatMessage;
/**
 * Represents a chunk of a chat message, which can be concatenated with
 * other chat message chunks.
 */
class ChatMessageChunk extends base_js_1.BaseMessageChunk {
    static lc_name() {
        return "ChatMessageChunk";
    }
    constructor(fields, role) {
        if (typeof fields === "string") {
            // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-non-null-assertion
            fields = { content: fields, role: role };
        }
        super(fields);
        Object.defineProperty(this, "role", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.role = fields.role;
    }
    _getType() {
        return "generic";
    }
    concat(chunk) {
        return new ChatMessageChunk({
            content: (0, base_js_1.mergeContent)(this.content, chunk.content),
            additional_kwargs: (0, base_js_1._mergeDicts)(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: (0, base_js_1._mergeDicts)(this.response_metadata, chunk.response_metadata),
            role: this.role,
            id: this.id ?? chunk.id,
        });
    }
    get _printableFields() {
        return {
            ...super._printableFields,
            role: this.role,
        };
    }
}
exports.ChatMessageChunk = ChatMessageChunk;
function isChatMessage(x) {
    return x._getType() === "generic";
}
exports.isChatMessage = isChatMessage;
function isChatMessageChunk(x) {
    return x._getType() === "generic";
}
exports.isChatMessageChunk = isChatMessageChunk;
