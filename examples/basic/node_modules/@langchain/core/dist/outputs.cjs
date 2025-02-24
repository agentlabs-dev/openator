"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGenerationChunk = exports.GenerationChunk = exports.RUN_KEY = void 0;
exports.RUN_KEY = "__run";
/**
 * Chunk of a single generation. Used for streaming.
 */
class GenerationChunk {
    constructor(fields) {
        Object.defineProperty(this, "text", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.defineProperty(this, "generationInfo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.text = fields.text;
        this.generationInfo = fields.generationInfo;
    }
    concat(chunk) {
        return new GenerationChunk({
            text: this.text + chunk.text,
            generationInfo: {
                ...this.generationInfo,
                ...chunk.generationInfo,
            },
        });
    }
}
exports.GenerationChunk = GenerationChunk;
class ChatGenerationChunk extends GenerationChunk {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "message", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.message = fields.message;
    }
    concat(chunk) {
        return new ChatGenerationChunk({
            text: this.text + chunk.text,
            generationInfo: {
                ...this.generationInfo,
                ...chunk.generationInfo,
            },
            message: this.message.concat(chunk.message),
        });
    }
}
exports.ChatGenerationChunk = ChatGenerationChunk;
