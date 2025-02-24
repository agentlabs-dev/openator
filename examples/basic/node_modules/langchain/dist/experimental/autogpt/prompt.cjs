"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoGPTPrompt = void 0;
const prompts_1 = require("@langchain/core/prompts");
const messages_1 = require("@langchain/core/messages");
const prompt_generator_js_1 = require("./prompt_generator.cjs");
/**
 * Class used to generate prompts for the AutoGPT model. It takes into
 * account the AI's name, role, tools, token counter, and send token
 * limit. The class also handles the formatting of messages and the
 * construction of the full prompt.
 */
class AutoGPTPrompt extends prompts_1.BaseChatPromptTemplate {
    constructor(fields) {
        super({ inputVariables: ["goals", "memory", "messages", "user_input"] });
        Object.defineProperty(this, "aiName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "aiRole", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tokenCounter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sendTokenLimit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.aiName = fields.aiName;
        this.aiRole = fields.aiRole;
        this.tools = fields.tools;
        this.tokenCounter = fields.tokenCounter;
        this.sendTokenLimit = fields.sendTokenLimit || 4196;
    }
    _getPromptType() {
        return "autogpt";
    }
    /**
     * Constructs the full prompt based on the provided goals.
     * @param goals An array of goals.
     * @returns The full prompt as a string.
     */
    constructFullPrompt(goals) {
        const promptStart = `Your decisions must always be made independently
            without seeking user assistance. Play to your strengths
            as an LLM and pursue simple strategies with no legal complications.
            If you have completed all your tasks,
            make sure to use the "finish" command.`;
        let fullPrompt = `You are ${this.aiName}, ${this.aiRole}\n${promptStart}\n\nGOALS:\n\n`;
        goals.forEach((goal, index) => {
            fullPrompt += `${index + 1}. ${goal}\n`;
        });
        fullPrompt += `\n\n${(0, prompt_generator_js_1.getPrompt)(this.tools)}`;
        return fullPrompt;
    }
    /**
     * Formats the messages based on the provided parameters.
     * @param goals An array of goals.
     * @param memory A VectorStoreRetriever instance.
     * @param messages An array of previous messages.
     * @param user_input The user's input.
     * @returns An array of formatted messages.
     */
    async formatMessages({ goals, memory, messages: previousMessages, user_input, }) {
        const basePrompt = new messages_1.SystemMessage(this.constructFullPrompt(goals));
        const timePrompt = new messages_1.SystemMessage(`The current time and date is ${new Date().toLocaleString()}`);
        if (typeof basePrompt.content !== "string" ||
            typeof timePrompt.content !== "string") {
            throw new Error("Non-string message content is not supported.");
        }
        const usedTokens = (await this.tokenCounter(basePrompt.content)) +
            (await this.tokenCounter(timePrompt.content));
        const relevantDocs = await memory.getRelevantDocuments(JSON.stringify(previousMessages.slice(-10)));
        const relevantMemory = relevantDocs.map((d) => d.pageContent);
        let relevantMemoryTokens = await relevantMemory.reduce(async (acc, doc) => (await acc) + (await this.tokenCounter(doc)), Promise.resolve(0));
        while (usedTokens + relevantMemoryTokens > 2500) {
            relevantMemory.pop();
            relevantMemoryTokens = await relevantMemory.reduce(async (acc, doc) => (await acc) + (await this.tokenCounter(doc)), Promise.resolve(0));
        }
        const contentFormat = `This reminds you of these events from your past:\n${relevantMemory.join("\n")}\n\n`;
        const memoryMessage = new messages_1.SystemMessage(contentFormat);
        if (typeof memoryMessage.content !== "string") {
            throw new Error("Non-string message content is not supported.");
        }
        const usedTokensWithMemory = usedTokens + (await this.tokenCounter(memoryMessage.content));
        const historicalMessages = [];
        for (const message of previousMessages.slice(-10).reverse()) {
            if (typeof message.content !== "string") {
                throw new Error("Non-string message content is not supported.");
            }
            const messageTokens = await this.tokenCounter(message.content);
            if (usedTokensWithMemory + messageTokens > this.sendTokenLimit - 1000) {
                break;
            }
            historicalMessages.unshift(message);
        }
        const inputMessage = new messages_1.HumanMessage(user_input);
        const messages = [
            basePrompt,
            timePrompt,
            memoryMessage,
            ...historicalMessages,
            inputMessage,
        ];
        return messages;
    }
    /**
     * This method is not implemented in the AutoGPTPrompt class and will
     * throw an error if called.
     * @param _values Partial values.
     * @returns Throws an error.
     */
    async partial(_values) {
        throw new Error("Method not implemented.");
    }
    serialize() {
        throw new Error("Method not implemented.");
    }
}
exports.AutoGPTPrompt = AutoGPTPrompt;
