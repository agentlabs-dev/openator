"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationTokenBufferMemory = void 0;
const messages_1 = require("@langchain/core/messages");
const chat_memory_js_1 = require("./chat_memory.cjs");
/**
 * Class that represents a conversation chat memory with a token buffer.
 * It extends the `BaseChatMemory` class and implements the
 * `ConversationTokenBufferMemoryInput` interface.
 * @example
 * ```typescript
 * const memory = new ConversationTokenBufferMemory({
 *   llm: new ChatOpenAI({}),
 *   maxTokenLimit: 10,
 * });
 *
 * // Save conversation context
 * await memory.saveContext({ input: "hi" }, { output: "whats up" });
 * await memory.saveContext({ input: "not much you" }, { output: "not much" });
 *
 * // Load memory variables
 * const result = await memory.loadMemoryVariables({});
 * console.log(result);
 * ```
 */
class ConversationTokenBufferMemory extends chat_memory_js_1.BaseChatMemory {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "humanPrefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Human"
        });
        Object.defineProperty(this, "aiPrefix", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AI"
        });
        Object.defineProperty(this, "memoryKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "history"
        });
        Object.defineProperty(this, "maxTokenLimit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 2000
        }); // Default max token limit of 2000 which can be overridden
        Object.defineProperty(this, "llm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.llm = fields.llm;
        this.humanPrefix = fields?.humanPrefix ?? this.humanPrefix;
        this.aiPrefix = fields?.aiPrefix ?? this.aiPrefix;
        this.memoryKey = fields?.memoryKey ?? this.memoryKey;
        this.maxTokenLimit = fields?.maxTokenLimit ?? this.maxTokenLimit;
    }
    get memoryKeys() {
        return [this.memoryKey];
    }
    /**
     * Loads the memory variables. It takes an `InputValues` object as a
     * parameter and returns a `Promise` that resolves with a
     * `MemoryVariables` object.
     * @param _values `InputValues` object.
     * @returns A `Promise` that resolves with a `MemoryVariables` object.
     */
    async loadMemoryVariables(_values) {
        const messages = await this.chatHistory.getMessages();
        if (this.returnMessages) {
            const result = {
                [this.memoryKey]: messages,
            };
            return result;
        }
        const result = {
            [this.memoryKey]: (0, messages_1.getBufferString)(messages, this.humanPrefix, this.aiPrefix),
        };
        return result;
    }
    /**
     * Saves the context from this conversation to buffer. If the amount
     * of tokens required to save the buffer exceeds MAX_TOKEN_LIMIT,
     * prune it.
     */
    async saveContext(inputValues, outputValues) {
        await super.saveContext(inputValues, outputValues);
        // Prune buffer if it exceeds the max token limit set for this instance.
        const buffer = await this.chatHistory.getMessages();
        let currBufferLength = await this.llm.getNumTokens((0, messages_1.getBufferString)(buffer, this.humanPrefix, this.aiPrefix));
        if (currBufferLength > this.maxTokenLimit) {
            const prunedMemory = [];
            while (currBufferLength > this.maxTokenLimit) {
                prunedMemory.push(buffer.shift());
                currBufferLength = await this.llm.getNumTokens((0, messages_1.getBufferString)(buffer, this.humanPrefix, this.aiPrefix));
            }
        }
    }
}
exports.ConversationTokenBufferMemory = ConversationTokenBufferMemory;
