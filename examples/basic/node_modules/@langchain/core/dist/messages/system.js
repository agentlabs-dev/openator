import { BaseMessage, BaseMessageChunk, mergeContent, _mergeDicts, } from "./base.js";
/**
 * Represents a system message in a conversation.
 */
export class SystemMessage extends BaseMessage {
    static lc_name() {
        return "SystemMessage";
    }
    _getType() {
        return "system";
    }
}
/**
 * Represents a chunk of a system message, which can be concatenated with
 * other system message chunks.
 */
export class SystemMessageChunk extends BaseMessageChunk {
    static lc_name() {
        return "SystemMessageChunk";
    }
    _getType() {
        return "system";
    }
    concat(chunk) {
        return new SystemMessageChunk({
            content: mergeContent(this.content, chunk.content),
            additional_kwargs: _mergeDicts(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: _mergeDicts(this.response_metadata, chunk.response_metadata),
            id: this.id ?? chunk.id,
        });
    }
}
export function isSystemMessage(x) {
    return x._getType() === "system";
}
export function isSystemMessageChunk(x) {
    return x._getType() === "system";
}
