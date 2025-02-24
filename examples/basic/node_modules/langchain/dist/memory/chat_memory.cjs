"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseChatMemory = void 0;
const memory_1 = require("@langchain/core/memory");
const in_memory_js_1 = require("../stores/message/in_memory.cjs");
/**
 * Abstract class that provides a base for implementing different types of
 * memory systems. It is designed to maintain the state of an application,
 * specifically the history of a conversation. This class is typically
 * extended by other classes to create specific types of memory systems.
 */
class BaseChatMemory extends memory_1.BaseMemory {
    constructor(fields) {
        super();
        Object.defineProperty(this, "chatHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "returnMessages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "inputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.chatHistory = fields?.chatHistory ?? new in_memory_js_1.ChatMessageHistory();
        this.returnMessages = fields?.returnMessages ?? this.returnMessages;
        this.inputKey = fields?.inputKey ?? this.inputKey;
        this.outputKey = fields?.outputKey ?? this.outputKey;
    }
    /**
     * Method to add user and AI messages to the chat history in sequence.
     * @param inputValues The input values from the user.
     * @param outputValues The output values from the AI.
     * @returns Promise that resolves when the context has been saved.
     */
    async saveContext(inputValues, outputValues) {
        // this is purposefully done in sequence so they're saved in order
        await this.chatHistory.addUserMessage((0, memory_1.getInputValue)(inputValues, this.inputKey));
        await this.chatHistory.addAIChatMessage((0, memory_1.getOutputValue)(outputValues, this.outputKey));
    }
    /**
     * Method to clear the chat history.
     * @returns Promise that resolves when the chat history has been cleared.
     */
    async clear() {
        await this.chatHistory.clear();
    }
}
exports.BaseChatMemory = BaseChatMemory;
