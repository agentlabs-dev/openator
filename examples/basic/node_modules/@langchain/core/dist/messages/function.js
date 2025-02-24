import { BaseMessage, BaseMessageChunk, mergeContent, _mergeDicts, } from "./base.js";
/**
 * Represents a function message in a conversation.
 */
export class FunctionMessage extends BaseMessage {
    static lc_name() {
        return "FunctionMessage";
    }
    constructor(fields, 
    /** @deprecated */
    name) {
        if (typeof fields === "string") {
            // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-non-null-assertion
            fields = { content: fields, name: name };
        }
        super(fields);
    }
    _getType() {
        return "function";
    }
}
/**
 * Represents a chunk of a function message, which can be concatenated
 * with other function message chunks.
 */
export class FunctionMessageChunk extends BaseMessageChunk {
    static lc_name() {
        return "FunctionMessageChunk";
    }
    _getType() {
        return "function";
    }
    concat(chunk) {
        return new FunctionMessageChunk({
            content: mergeContent(this.content, chunk.content),
            additional_kwargs: _mergeDicts(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: _mergeDicts(this.response_metadata, chunk.response_metadata),
            name: this.name ?? "",
            id: this.id ?? chunk.id,
        });
    }
}
export function isFunctionMessage(x) {
    return x._getType() === "function";
}
export function isFunctionMessageChunk(x) {
    return x._getType() === "function";
}
