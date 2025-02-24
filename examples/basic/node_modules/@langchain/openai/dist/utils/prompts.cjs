"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPromptToOpenAI = void 0;
const chat_models_js_1 = require("../chat_models.cjs");
/**
 * Convert a formatted LangChain prompt (e.g. pulled from the hub) into
 * a format expected by OpenAI's JS SDK.
 *
 * Requires the "@langchain/openai" package to be installed in addition
 * to the OpenAI SDK.
 *
 * @example
 * ```ts
 * import { convertPromptToOpenAI } from "langsmith/utils/hub/openai";
 * import { pull } from "langchain/hub";
 *
 * import OpenAI from 'openai';
 *
 * const prompt = await pull("jacob/joke-generator");
 * const formattedPrompt = await prompt.invoke({
 *   topic: "cats",
 * });
 *
 * const { messages } = convertPromptToOpenAI(formattedPrompt);
 *
 * const openAIClient = new OpenAI();
 *
 * const openaiResponse = await openAIClient.chat.completions.create({
 *   model: "gpt-4o",
 *   messages,
 * });
 * ```
 * @param formattedPrompt
 * @returns A partial OpenAI payload.
 */
function convertPromptToOpenAI(formattedPrompt) {
    const messages = formattedPrompt.toChatMessages();
    return {
        messages: (0, chat_models_js_1._convertMessagesToOpenAIParams)(messages),
    };
}
exports.convertPromptToOpenAI = convertPromptToOpenAI;
