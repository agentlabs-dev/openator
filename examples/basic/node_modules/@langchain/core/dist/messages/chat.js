import { BaseMessage, BaseMessageChunk, mergeContent, _mergeDicts, } from "./base.js";
/**
 * Represents a chat message in a conversation.
 */
export class ChatMessage extends BaseMessage {
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
/**
 * Represents a chunk of a chat message, which can be concatenated with
 * other chat message chunks.
 */
export class ChatMessageChunk extends BaseMessageChunk {
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
            content: mergeContent(this.content, chunk.content),
            additional_kwargs: _mergeDicts(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: _mergeDicts(this.response_metadata, chunk.response_metadata),
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
export function isChatMessage(x) {
    return x._getType() === "generic";
}
export function isChatMessageChunk(x) {
    return x._getType() === "generic";
}
