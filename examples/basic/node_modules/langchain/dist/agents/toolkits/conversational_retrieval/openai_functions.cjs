"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConversationalRetrievalAgent = void 0;
const summary_buffer_js_1 = require("../../../memory/summary_buffer.cjs");
const initialize_js_1 = require("../../initialize.cjs");
const token_buffer_memory_js_1 = require("./token_buffer_memory.cjs");
/**
 * Asynchronous function that creates a conversational retrieval agent
 * using a language model, tools, and options. It initializes the buffer
 * memory based on the provided options and initializes the AgentExecutor
 * with the tools, language model, and memory.
 * @param llm Instance of ChatOpenAI used as the language model for the agent.
 * @param tools Array of StructuredTool instances used by the agent.
 * @param options Optional ConversationalRetrievalAgentOptions to customize the agent.
 * @returns A Promise that resolves to an initialized AgentExecutor.
 */
async function createConversationalRetrievalAgent(llm, tools, options) {
    const { rememberIntermediateSteps = true, memoryKey = "chat_history", outputKey = "output", inputKey = "input", prefix, verbose, } = options ?? {};
    let memory;
    if (rememberIntermediateSteps) {
        memory = new token_buffer_memory_js_1.OpenAIAgentTokenBufferMemory({
            memoryKey,
            llm,
            outputKey,
            inputKey,
        });
    }
    else {
        memory = new summary_buffer_js_1.ConversationSummaryBufferMemory({
            memoryKey,
            llm,
            maxTokenLimit: 12000,
            returnMessages: true,
            outputKey,
            inputKey,
        });
    }
    const executor = await (0, initialize_js_1.initializeAgentExecutorWithOptions)(tools, llm, {
        agentType: "openai-functions",
        memory,
        verbose,
        returnIntermediateSteps: rememberIntermediateSteps,
        agentArgs: {
            prefix: prefix ??
                `Do your best to answer the questions. Feel free to use any tools available to look up relevant information, only if necessary.`,
        },
    });
    return executor;
}
exports.createConversationalRetrievalAgent = createConversationalRetrievalAgent;
