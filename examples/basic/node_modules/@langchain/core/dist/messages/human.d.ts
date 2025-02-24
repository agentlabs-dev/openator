import { BaseMessage, BaseMessageChunk, type MessageType } from "./base.js";
/**
 * Represents a human message in a conversation.
 */
export declare class HumanMessage extends BaseMessage {
    static lc_name(): string;
    _getType(): MessageType;
}
/**
 * Represents a chunk of a human message, which can be concatenated with
 * other human message chunks.
 */
export declare class HumanMessageChunk extends BaseMessageChunk {
    static lc_name(): string;
    _getType(): MessageType;
    concat(chunk: HumanMessageChunk): HumanMessageChunk;
}
export declare function isHumanMessage(x: BaseMessage): x is HumanMessage;
export declare function isHumanMessageChunk(x: BaseMessageChunk): x is HumanMessageChunk;
