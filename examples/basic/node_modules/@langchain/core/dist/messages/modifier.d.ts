import { BaseMessage, BaseMessageFields, MessageType } from "./base.js";
export interface RemoveMessageFields extends Omit<BaseMessageFields, "content"> {
    /**
     * The ID of the message to remove.
     */
    id: string;
}
/**
 * Message responsible for deleting other messages.
 */
export declare class RemoveMessage extends BaseMessage {
    /**
     * The ID of the message to remove.
     */
    id: string;
    constructor(fields: RemoveMessageFields);
    _getType(): MessageType;
    get _printableFields(): Record<string, unknown>;
}
