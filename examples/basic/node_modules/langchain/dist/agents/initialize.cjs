"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAgentExecutorWithOptions = exports.initializeAgentExecutor = void 0;
const buffer_memory_js_1 = require("../memory/buffer_memory.cjs");
const index_js_1 = require("./chat/index.cjs");
const index_js_2 = require("./chat_convo/index.cjs");
const index_js_3 = require("./structured_chat/index.cjs");
const executor_js_1 = require("./executor.cjs");
const index_js_4 = require("./mrkl/index.cjs");
const index_js_5 = require("./openai_functions/index.cjs");
const index_js_6 = require("./xml/index.cjs");
/**
 * @deprecated See {@link https://js.langchain.com/docs/modules/agents/agent_types/ | new agent creation docs}.
 */
const initializeAgentExecutor = async (tools, llm, _agentType, _verbose, _callbackManager) => {
    const agentType = _agentType ?? "zero-shot-react-description";
    const verbose = _verbose;
    const callbackManager = _callbackManager;
    switch (agentType) {
        case "zero-shot-react-description":
            return executor_js_1.AgentExecutor.fromAgentAndTools({
                agent: index_js_4.ZeroShotAgent.fromLLMAndTools(llm, tools),
                tools,
                returnIntermediateSteps: true,
                verbose,
                callbackManager,
            });
        case "chat-zero-shot-react-description":
            return executor_js_1.AgentExecutor.fromAgentAndTools({
                agent: index_js_1.ChatAgent.fromLLMAndTools(llm, tools),
                tools,
                returnIntermediateSteps: true,
                verbose,
                callbackManager,
            });
        case "chat-conversational-react-description":
            return executor_js_1.AgentExecutor.fromAgentAndTools({
                agent: index_js_2.ChatConversationalAgent.fromLLMAndTools(llm, tools),
                tools,
                verbose,
                callbackManager,
            });
        default:
            throw new Error("Unknown agent type");
    }
};
exports.initializeAgentExecutor = initializeAgentExecutor;
/** @deprecated See {@link https://js.langchain.com/docs/modules/agents/agent_types/ | new agent creation docs}. */
async function initializeAgentExecutorWithOptions(tools, llm, options = {
    agentType: llm._modelType() === "base_chat_model"
        ? "chat-zero-shot-react-description"
        : "zero-shot-react-description",
}) {
    // Note this tools cast is safe as the overload signatures prevent
    // the function from being called with a StructuredTool[] when
    // the agentType is not in InitializeAgentExecutorOptionsStructured
    switch (options.agentType) {
        case "zero-shot-react-description": {
            const { agentArgs, tags, ...rest } = options;
            return executor_js_1.AgentExecutor.fromAgentAndTools({
                tags: [...(tags ?? []), "zero-shot-react-description"],
                agent: index_js_4.ZeroShotAgent.fromLLMAndTools(llm, tools, agentArgs),
                tools,
                ...rest,
            });
        }
        case "chat-zero-shot-react-description": {
            const { agentArgs, tags, ...rest } = options;
            return executor_js_1.AgentExecutor.fromAgentAndTools({
                tags: [...(tags ?? []), "chat-zero-shot-react-description"],
                agent: index_js_1.ChatAgent.fromLLMAndTools(llm, tools, agentArgs),
                tools,
                ...rest,
            });
        }
        case "chat-conversational-react-description": {
            const { agentArgs, memory, tags, ...rest } = options;
            const executor = executor_js_1.AgentExecutor.fromAgentAndTools({
                tags: [...(tags ?? []), "chat-conversational-react-description"],
                agent: index_js_2.ChatConversationalAgent.fromLLMAndTools(llm, tools, agentArgs),
                tools,
                memory: memory ??
                    new buffer_memory_js_1.BufferMemory({
                        returnMessages: true,
                        memoryKey: "chat_history",
                        inputKey: "input",
                        outputKey: "output",
                    }),
                ...rest,
            });
            return executor;
        }
        case "xml": {
            const { agentArgs, tags, ...rest } = options;
            const executor = executor_js_1.AgentExecutor.fromAgentAndTools({
                tags: [...(tags ?? []), "xml"],
                agent: index_js_6.XMLAgent.fromLLMAndTools(llm, tools, agentArgs),
                tools,
                ...rest,
            });
            return executor;
        }
        case "structured-chat-zero-shot-react-description": {
            const { agentArgs, memory, tags, ...rest } = options;
            const executor = executor_js_1.AgentExecutor.fromAgentAndTools({
                tags: [...(tags ?? []), "structured-chat-zero-shot-react-description"],
                agent: index_js_3.StructuredChatAgent.fromLLMAndTools(llm, tools, agentArgs),
                tools,
                memory,
                ...rest,
            });
            return executor;
        }
        case "openai-functions": {
            const { agentArgs, memory, tags, ...rest } = options;
            const executor = executor_js_1.AgentExecutor.fromAgentAndTools({
                tags: [...(tags ?? []), "openai-functions"],
                agent: index_js_5.OpenAIAgent.fromLLMAndTools(llm, tools, agentArgs),
                tools,
                memory: memory ??
                    new buffer_memory_js_1.BufferMemory({
                        returnMessages: true,
                        memoryKey: "chat_history",
                        inputKey: "input",
                        outputKey: "output",
                    }),
                ...rest,
            });
            return executor;
        }
        default: {
            throw new Error("Unknown agent type");
        }
    }
}
exports.initializeAgentExecutorWithOptions = initializeAgentExecutorWithOptions;
