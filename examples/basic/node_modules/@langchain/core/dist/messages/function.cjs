"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFunctionMessageChunk = exports.isFunctionMessage = exports.FunctionMessageChunk = exports.FunctionMessage = void 0;
const base_js_1 = require("./base.cjs");
/**
 * Represents a function message in a conversation.
 */
class FunctionMessage extends base_js_1.BaseMessage {
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
exports.FunctionMessage = FunctionMessage;
/**
 * Represents a chunk of a function message, which can be concatenated
 * with other function message chunks.
 */
class FunctionMessageChunk extends base_js_1.BaseMessageChunk {
    static lc_name() {
        return "FunctionMessageChunk";
    }
    _getType() {
        return "function";
    }
    concat(chunk) {
        return new FunctionMessageChunk({
            content: (0, base_js_1.mergeContent)(this.content, chunk.content),
            additional_kwargs: (0, base_js_1._mergeDicts)(this.additional_kwargs, chunk.additional_kwargs),
            response_metadata: (0, base_js_1._mergeDicts)(this.response_metadata, chunk.response_metadata),
            name: this.name ?? "",
            id: this.id ?? chunk.id,
        });
    }
}
exports.FunctionMessageChunk = FunctionMessageChunk;
function isFunctionMessage(x) {
    return x._getType() === "function";
}
exports.isFunctionMessage = isFunctionMessage;
function isFunctionMessageChunk(x) {
    return x._getType() === "function";
}
exports.isFunctionMessageChunk = isFunctionMessageChunk;
