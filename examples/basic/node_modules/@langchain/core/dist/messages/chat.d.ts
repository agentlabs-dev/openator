import { BaseMessage, BaseMessageChunk, type BaseMessageFields, type MessageType } from "./base.js";
export interface ChatMessageFieldsWithRole extends BaseMessageFields {
    role: string;
}
/**
 * Represents a chat message in a conversation.
 */
export declare class ChatMessage extends BaseMessage implements ChatMessageFieldsWithRole {
    static lc_name(): string;
    role: string;
    static _chatMessageClass(): typeof ChatMessage;
    constructor(content: string, role: string);
    constructor(fields: ChatMessageFieldsWithRole);
    _getType(): MessageType;
    static isInstance(message: BaseMessage): message is ChatMessage;
    get _printableFields(): Record<string, unknown>;
}
/**
 * Represents a chunk of a chat message, which can be concatenated with
 * other chat message chunks.
 */
export declare class ChatMessageChunk extends BaseMessageChunk {
    static lc_name(): string;
    role: string;
    constructor(content: string, role: string);
    constructor(fields: ChatMessageFieldsWithRole);
    _getType(): MessageType;
    concat(chunk: ChatMessageChunk): ChatMessageChunk;
    get _printableFields(): Record<string, unknown>;
}
export declare function isChatMessage(x: BaseMessage): x is ChatMessage;
export declare function isChatMessageChunk(x: BaseMessageChunk): x is ChatMessageChunk;
