"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHistoryAwareRetriever = void 0;
const runnables_1 = require("@langchain/core/runnables");
const output_parsers_1 = require("@langchain/core/output_parsers");
/**
 * Create a chain that takes conversation history and returns documents.
 * If there is no `chat_history`, then the `input` is just passed directly to the
 * retriever. If there is `chat_history`, then the prompt and LLM will be used
 * to generate a search query. That search query is then passed to the retriever.
 * @param {CreateHistoryAwareRetriever} params
 * @returns An LCEL Runnable. The runnable input must take in `input`, and if there
 * is chat history should take it in the form of `chat_history`.
 * The Runnable output is a list of Documents
 * @example
 * ```typescript
 * // yarn add langchain @langchain/openai
 *
 * import { ChatOpenAI } from "@langchain/openai";
 * import { pull } from "langchain/hub";
 * import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
 *
 * const rephrasePrompt = await pull("langchain-ai/chat-langchain-rephrase");
 * const llm = new ChatOpenAI({});
 * const retriever = ...
 * const chain = await createHistoryAwareRetriever({
 *   llm,
 *   retriever,
 *   rephrasePrompt,
 * });
 * const result = await chain.invoke({"input": "...", "chat_history": [] })
 * ```
 */
async function createHistoryAwareRetriever({ llm, retriever, rephrasePrompt, }) {
    if (!rephrasePrompt.inputVariables.includes("input")) {
        throw new Error(`Expected "input" to be a prompt variable, but got ${JSON.stringify(rephrasePrompt.inputVariables)}`);
    }
    const retrieveDocuments = runnables_1.RunnableBranch.from([
        [
            (input) => !input.chat_history || input.chat_history.length === 0,
            runnables_1.RunnableSequence.from([(input) => input.input, retriever]),
        ],
        runnables_1.RunnableSequence.from([
            rephrasePrompt,
            llm,
            new output_parsers_1.StringOutputParser(),
            retriever,
        ]),
    ]).withConfig({
        runName: "history_aware_retriever",
    });
    return retrieveDocuments;
}
exports.createHistoryAwareRetriever = createHistoryAwareRetriever;
