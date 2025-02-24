import { BaseMessage, BaseMessageChunk, type MessageType } from "./base.js";
/**
 * Represents a system message in a conversation.
 */
export declare class SystemMessage extends BaseMessage {
    static lc_name(): string;
    _getType(): MessageType;
}
/**
 * Represents a chunk of a system message, which can be concatenated with
 * other system message chunks.
 */
export declare class SystemMessageChunk extends BaseMessageChunk {
    static lc_name(): string;
    _getType(): MessageType;
    concat(chunk: SystemMessageChunk): SystemMessageChunk;
}
export declare function isSystemMessage(x: BaseMessage): x is SystemMessage;
export declare function isSystemMessageChunk(x: BaseMessageChunk): x is SystemMessageChunk;
