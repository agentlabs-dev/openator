import { BaseMessage, BaseMessageChunk, type BaseMessageFields, type MessageType } from "./base.js";
export interface FunctionMessageFieldsWithName extends BaseMessageFields {
    name: string;
}
/**
 * Represents a function message in a conversation.
 */
export declare class FunctionMessage extends BaseMessage {
    static lc_name(): string;
    constructor(fields: FunctionMessageFieldsWithName);
    constructor(fields: string | BaseMessageFields, 
    /** @deprecated */
    name: string);
    _getType(): MessageType;
}
/**
 * Represents a chunk of a function message, which can be concatenated
 * with other function message chunks.
 */
export declare class FunctionMessageChunk extends BaseMessageChunk {
    static lc_name(): string;
    _getType(): MessageType;
    concat(chunk: FunctionMessageChunk): FunctionMessageChunk;
}
export declare function isFunctionMessage(x: BaseMessage): x is FunctionMessage;
export declare function isFunctionMessageChunk(x: BaseMessageChunk): x is FunctionMessageChunk;
