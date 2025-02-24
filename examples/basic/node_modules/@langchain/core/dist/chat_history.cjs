"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryChatMessageHistory = exports.BaseListChatMessageHistory = exports.BaseChatMessageHistory = void 0;
const serializable_js_1 = require("./load/serializable.cjs");
const index_js_1 = require("./messages/index.cjs");
// TODO: Combine into one class for 0.2
/**
 * Base class for all chat message histories. All chat message histories
 * should extend this class.
 */
class BaseChatMessageHistory extends serializable_js_1.Serializable {
    /**
     * Add a list of messages.
     *
     * Implementations should override this method to handle bulk addition of messages
     * in an efficient manner to avoid unnecessary round-trips to the underlying store.
     *
     * @param messages - A list of BaseMessage objects to store.
     */
    async addMessages(messages) {
        for (const message of messages) {
            await this.addMessage(message);
        }
    }
}
exports.BaseChatMessageHistory = BaseChatMessageHistory;
/**
 * Base class for all list chat message histories. All list chat message
 * histories should extend this class.
 */
class BaseListChatMessageHistory extends serializable_js_1.Serializable {
    /**
     * This is a convenience method for adding a human message string to the store.
     * Please note that this is a convenience method. Code should favor the
     * bulk addMessages interface instead to save on round-trips to the underlying
     * persistence layer.
     * This method may be deprecated in a future release.
     */
    addUserMessage(message) {
        return this.addMessage(new index_js_1.HumanMessage(message));
    }
    /** @deprecated Use addAIMessage instead */
    addAIChatMessage(message) {
        return this.addMessage(new index_js_1.AIMessage(message));
    }
    /**
     * This is a convenience method for adding an AI message string to the store.
     * Please note that this is a convenience method. Code should favor the bulk
     * addMessages interface instead to save on round-trips to the underlying
     * persistence layer.
     * This method may be deprecated in a future release.
     */
    addAIMessage(message) {
        return this.addMessage(new index_js_1.AIMessage(message));
    }
    /**
     * Add a list of messages.
     *
     * Implementations should override this method to handle bulk addition of messages
     * in an efficient manner to avoid unnecessary round-trips to the underlying store.
     *
     * @param messages - A list of BaseMessage objects to store.
     */
    async addMessages(messages) {
        for (const message of messages) {
            await this.addMessage(message);
        }
    }
    /**
     * Remove all messages from the store.
     */
    clear() {
        throw new Error("Not implemented.");
    }
}
exports.BaseListChatMessageHistory = BaseListChatMessageHistory;
/**
 * Class for storing chat message history in-memory. It extends the
 * BaseListChatMessageHistory class and provides methods to get, add, and
 * clear messages.
 */
class InMemoryChatMessageHistory extends BaseListChatMessageHistory {
    constructor(messages) {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "stores", "message", "in_memory"]
        });
        Object.defineProperty(this, "messages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.messages = messages ?? [];
    }
    /**
     * Method to get all the messages stored in the ChatMessageHistory
     * instance.
     * @returns Array of stored BaseMessage instances.
     */
    async getMessages() {
        return this.messages;
    }
    /**
     * Method to add a new message to the ChatMessageHistory instance.
     * @param message The BaseMessage instance to add.
     * @returns A promise that resolves when the message has been added.
     */
    async addMessage(message) {
        this.messages.push(message);
    }
    /**
     * Method to clear all the messages from the ChatMessageHistory instance.
     * @returns A promise that resolves when all messages have been cleared.
     */
    async clear() {
        this.messages = [];
    }
}
exports.InMemoryChatMessageHistory = InMemoryChatMessageHistory;
