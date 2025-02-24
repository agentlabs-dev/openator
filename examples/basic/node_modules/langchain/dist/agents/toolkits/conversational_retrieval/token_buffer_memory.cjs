"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIAgentTokenBufferMemory = void 0;
const memory_1 = require("@langchain/core/memory");
const messages_1 = require("@langchain/core/messages");
const chat_memory_js_1 = require("../../../memory/chat_memory.cjs");
const index_js_1 = require("../../openai_functions/index.cjs");
/**
 * Memory used to save agent output and intermediate steps.
 */
class OpenAIAgentTokenBufferMemory extends chat_memory_js_1.BaseChatMemory {
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
        Object.defineProperty(this, "llm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
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
            value: 12000
        });
        Object.defineProperty(this, "returnMessages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "outputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "output"
        });
        Object.defineProperty(this, "intermediateStepsKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "intermediateSteps"
        });
        this.humanPrefix = fields.humanPrefix ?? this.humanPrefix;
        this.aiPrefix = fields.aiPrefix ?? this.aiPrefix;
        this.llm = fields.llm;
        this.memoryKey = fields.memoryKey ?? this.memoryKey;
        this.maxTokenLimit = fields.maxTokenLimit ?? this.maxTokenLimit;
        this.returnMessages = fields.returnMessages ?? this.returnMessages;
        this.outputKey = fields.outputKey ?? this.outputKey;
        this.intermediateStepsKey =
            fields.intermediateStepsKey ?? this.intermediateStepsKey;
    }
    get memoryKeys() {
        return [this.memoryKey];
    }
    /**
     * Retrieves the messages from the chat history.
     * @returns Promise that resolves with the messages from the chat history.
     */
    async getMessages() {
        return this.chatHistory.getMessages();
    }
    /**
     * Loads memory variables from the input values.
     * @param _values Input values.
     * @returns Promise that resolves with the loaded memory variables.
     */
    async loadMemoryVariables(_values) {
        const buffer = await this.getMessages();
        if (this.returnMessages) {
            return { [this.memoryKey]: buffer };
        }
        else {
            const bufferString = (0, messages_1.getBufferString)(buffer, this.humanPrefix, this.aiPrefix);
            return { [this.memoryKey]: bufferString };
        }
    }
    /**
     * Saves the context of the chat, including user input, AI output, and
     * intermediate steps. Prunes the chat history if the total token count
     * exceeds the maximum limit.
     * @param inputValues Input values.
     * @param outputValues Output values.
     * @returns Promise that resolves when the context has been saved.
     */
    async saveContext(inputValues, outputValues) {
        const inputValue = (0, memory_1.getInputValue)(inputValues, this.inputKey);
        const outputValue = (0, memory_1.getOutputValue)(outputValues, this.outputKey);
        await this.chatHistory.addUserMessage(inputValue);
        const intermediateStepMessages = (0, index_js_1._formatIntermediateSteps)(outputValues[this.intermediateStepsKey]);
        for (const message of intermediateStepMessages) {
            await this.chatHistory.addMessage(message);
        }
        await this.chatHistory.addAIChatMessage(outputValue);
        const currentMessages = await this.chatHistory.getMessages();
        let tokenInfo = await this.llm.getNumTokensFromMessages(currentMessages);
        if (tokenInfo.totalCount > this.maxTokenLimit) {
            const prunedMemory = [];
            while (tokenInfo.totalCount > this.maxTokenLimit) {
                const retainedMessage = currentMessages.pop();
                if (!retainedMessage) {
                    console.warn(`Could not prune enough messages from chat history to stay under ${this.maxTokenLimit} tokens.`);
                    break;
                }
                prunedMemory.push(retainedMessage);
                tokenInfo = await this.llm.getNumTokensFromMessages(currentMessages);
            }
            await this.chatHistory.clear();
            for (const message of prunedMemory) {
                await this.chatHistory.addMessage(message);
            }
        }
    }
}
exports.OpenAIAgentTokenBufferMemory = OpenAIAgentTokenBufferMemory;
