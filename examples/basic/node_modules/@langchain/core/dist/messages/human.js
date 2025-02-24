import { BaseMessage, BaseMessageChunk, mergeContent, _mergeDicts, } from "./base.js";
/**
 * Represents a human message in a conversation.
 */
export class HumanMessage extends BaseMessage {
    static lc_name() {
        return "HumanMessage";
    }
    _getType() {
        return "human";
    }
}
/**
 * Represents a chunk of a human message, which can be concatenated with
 * other human message chunks.
 */
export class HumanMessageChunk extends BaseMessageChunk {
    static lc_name() {
        return "HumanMessageChunk";
    }
    _getType() {
        return "human";
    }
    concat(chunk) {
        return new HumanMessageChunk({
            content: mergeContent(this.content, chunk.content),
            additional_kwargs: _mergeDicts(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: _mergeDicts(this.response_metadata, chunk.response_metadata),
            id: this.id ?? chunk.id,
        });
    }
}
export function isHumanMessage(x) {
    return x.getType() === "human";
}
export function isHumanMessageChunk(x) {
    return x.getType() === "human";
}
