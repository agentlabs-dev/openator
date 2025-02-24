"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolInputParsingException = exports._isToolCall = void 0;
function _isToolCall(toolCall) {
    return !!(toolCall &&
        typeof toolCall === "object" &&
        "type" in toolCall &&
        toolCall.type === "tool_call");
}
exports._isToolCall = _isToolCall;
/**
 * Custom error class used to handle exceptions related to tool input parsing.
 * It extends the built-in `Error` class and adds an optional `output`
 * property that can hold the output that caused the exception.
 */
class ToolInputParsingException extends Error {
    constructor(message, output) {
        super(message);
        Object.defineProperty(this, "output", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.output = output;
    }
}
exports.ToolInputParsingException = ToolInputParsingException;
