"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSystemMessageChunk = exports.isSystemMessage = exports.SystemMessageChunk = exports.SystemMessage = void 0;
const base_js_1 = require("./base.cjs");
/**
 * Represents a system message in a conversation.
 */
class SystemMessage extends base_js_1.BaseMessage {
    static lc_name() {
        return "SystemMessage";
    }
    _getType() {
        return "system";
    }
}
exports.SystemMessage = SystemMessage;
/**
 * Represents a chunk of a system message, which can be concatenated with
 * other system message chunks.
 */
class SystemMessageChunk extends base_js_1.BaseMessageChunk {
    static lc_name() {
        return "SystemMessageChunk";
    }
    _getType() {
        return "system";
    }
    concat(chunk) {
        return new SystemMessageChunk({
            content: (0, base_js_1.mergeContent)(this.content, chunk.content),
            additional_kwargs: (0, base_js_1._mergeDicts)(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: (0, base_js_1._mergeDicts)(this.response_metadata, chunk.response_metadata),
            id: this.id ?? chunk.id,
        });
    }
}
exports.SystemMessageChunk = SystemMessageChunk;
function isSystemMessage(x) {
    return x._getType() === "system";
}
exports.isSystemMessage = isSystemMessage;
function isSystemMessageChunk(x) {
    return x._getType() === "system";
}
exports.isSystemMessageChunk = isSystemMessageChunk;
