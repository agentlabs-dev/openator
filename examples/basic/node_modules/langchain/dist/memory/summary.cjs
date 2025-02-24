"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationSummaryMemory = exports.BaseConversationSummaryMemory = void 0;
const messages_1 = require("@langchain/core/messages");
const llm_chain_js_1 = require("../chains/llm_chain.cjs");
const prompt_js_1 = require("./prompt.cjs");
const chat_memory_js_1 = require("./chat_memory.cjs");
/**
 * Abstract class that provides a structure for storing and managing the
 * memory of a conversation. It includes methods for predicting a new
 * summary for the conversation given the existing messages and summary.
 */
class BaseConversationSummaryMemory extends chat_memory_js_1.BaseChatMemory {
    constructor(fields) {
        const { returnMessages, inputKey, outputKey, chatHistory, humanPrefix, aiPrefix, llm, prompt, summaryChatMessageClass, } = fields;
        super({ returnMessages, inputKey, outputKey, chatHistory });
        Object.defineProperty(this, "memoryKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "history"
        });
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
        Object.defineProperty(this, "prompt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: prompt_js_1.SUMMARY_PROMPT
        });
        Object.defineProperty(this, "summaryChatMessageClass", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: messages_1.SystemMessage
        });
        this.memoryKey = fields?.memoryKey ?? this.memoryKey;
        this.humanPrefix = humanPrefix ?? this.humanPrefix;
        this.aiPrefix = aiPrefix ?? this.aiPrefix;
        this.llm = llm;
        this.prompt = prompt ?? this.prompt;
        this.summaryChatMessageClass =
            summaryChatMessageClass ?? this.summaryChatMessageClass;
    }
    /**
     * Predicts a new summary for the conversation given the existing messages
     * and summary.
     * @param messages Existing messages in the conversation.
     * @param existingSummary Current summary of the conversation.
     * @returns A promise that resolves to a new summary string.
     */
    async predictNewSummary(messages, existingSummary) {
        const newLines = (0, messages_1.getBufferString)(messages, this.humanPrefix, this.aiPrefix);
        const chain = new llm_chain_js_1.LLMChain({ llm: this.llm, prompt: this.prompt });
        return await chain.predict({
            summary: existingSummary,
            new_lines: newLines,
        });
    }
}
exports.BaseConversationSummaryMemory = BaseConversationSummaryMemory;
/**
 * Class that provides a concrete implementation of the conversation
 * memory. It includes methods for loading memory variables, saving
 * context, and clearing the memory.
 * @example
 * ```typescript
 * const memory = new ConversationSummaryMemory({
 *   memoryKey: "chat_history",
 *   llm: new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 }),
 * });
 *
 * const model = new ChatOpenAI();
 * const prompt =
 *   PromptTemplate.fromTemplate(`The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.
 *
 * Current conversation:
 * {chat_history}
 * Human: {input}
 * AI:`);
 * const chain = new LLMChain({ llm: model, prompt, memory });
 *
 * const res1 = await chain.call({ input: "Hi! I'm Jim." });
 * console.log({ res1, memory: await memory.loadMemoryVariables({}) });
 *
 * const res2 = await chain.call({ input: "What's my name?" });
 * console.log({ res2, memory: await memory.loadMemoryVariables({}) });
 *
 * ```
 */
class ConversationSummaryMemory extends BaseConversationSummaryMemory {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "buffer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ""
        });
    }
    get memoryKeys() {
        return [this.memoryKey];
    }
    /**
     * Loads the memory variables for the conversation memory.
     * @returns A promise that resolves to an object containing the memory variables.
     */
    async loadMemoryVariables(_) {
        if (this.returnMessages) {
            const result = {
                [this.memoryKey]: [new this.summaryChatMessageClass(this.buffer)],
            };
            return result;
        }
        const result = { [this.memoryKey]: this.buffer };
        return result;
    }
    /**
     * Saves the context of the conversation memory.
     * @param inputValues Input values for the conversation.
     * @param outputValues Output values from the conversation.
     * @returns A promise that resolves when the context has been saved.
     */
    async saveContext(inputValues, outputValues) {
        await super.saveContext(inputValues, outputValues);
        const messages = await this.chatHistory.getMessages();
        this.buffer = await this.predictNewSummary(messages.slice(-2), this.buffer);
    }
    /**
     * Clears the conversation memory.
     * @returns A promise that resolves when the memory has been cleared.
     */
    async clear() {
        await super.clear();
        this.buffer = "";
    }
}
exports.ConversationSummaryMemory = ConversationSummaryMemory;
