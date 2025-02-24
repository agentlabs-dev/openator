import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import type { StructuredToolInterface, ToolInterface } from "@langchain/core/tools";
import { CallbackManager } from "@langchain/core/callbacks/manager";
import { ChatAgent } from "./chat/index.js";
import { ChatConversationalAgent } from "./chat_convo/index.js";
import { StructuredChatAgent } from "./structured_chat/index.js";
import { AgentExecutor, AgentExecutorInput } from "./executor.js";
import { ZeroShotAgent } from "./mrkl/index.js";
import { OpenAIAgent } from "./openai_functions/index.js";
import { XMLAgent } from "./xml/index.js";
/**
 * Represents the type of an agent in LangChain. It can be
 * "zero-shot-react-description", "chat-zero-shot-react-description", or
 * "chat-conversational-react-description".
 */
type AgentType = "zero-shot-react-description" | "chat-zero-shot-react-description" | "chat-conversational-react-description";
/**
 * @deprecated See {@link https://js.langchain.com/docs/modules/agents/agent_types/ | new agent creation docs}.
 */
export declare const initializeAgentExecutor: (tools: ToolInterface[], llm: BaseLanguageModelInterface, _agentType?: AgentType, _verbose?: boolean, _callbackManager?: CallbackManager) => Promise<AgentExecutor>;
/**
 * @interface
 */
export type InitializeAgentExecutorOptions = ({
    agentType: "zero-shot-react-description";
    agentArgs?: Parameters<typeof ZeroShotAgent.fromLLMAndTools>[2];
    memory?: never;
} & Omit<AgentExecutorInput, "agent" | "tools">) | ({
    agentType: "chat-zero-shot-react-description";
    agentArgs?: Parameters<typeof ChatAgent.fromLLMAndTools>[2];
    memory?: never;
} & Omit<AgentExecutorInput, "agent" | "tools">) | ({
    agentType: "chat-conversational-react-description";
    agentArgs?: Parameters<typeof ChatConversationalAgent.fromLLMAndTools>[2];
} & Omit<AgentExecutorInput, "agent" | "tools">) | ({
    agentType: "xml";
    agentArgs?: Parameters<typeof XMLAgent.fromLLMAndTools>[2];
} & Omit<AgentExecutorInput, "agent" | "tools">);
/**
 * @interface
 */
export type InitializeAgentExecutorOptionsStructured = ({
    agentType: "structured-chat-zero-shot-react-description";
    agentArgs?: Parameters<typeof StructuredChatAgent.fromLLMAndTools>[2];
} & Omit<AgentExecutorInput, "agent" | "tools">) | ({
    agentType: "openai-functions";
    agentArgs?: Parameters<typeof OpenAIAgent.fromLLMAndTools>[2];
} & Omit<AgentExecutorInput, "agent" | "tools">);
/**
 * Initialize an agent executor with options.
 * @deprecated See {@link https://js.langchain.com/docs/modules/agents/agent_types/ | new agent creation docs}.
 * @param tools Array of tools to use in the agent
 * @param llm LLM or ChatModel to use in the agent
 * @param options Options for the agent, including agentType, agentArgs, and other options for AgentExecutor.fromAgentAndTools
 * @returns AgentExecutor
 */
export declare function initializeAgentExecutorWithOptions(tools: StructuredToolInterface[], llm: BaseLanguageModelInterface, options: InitializeAgentExecutorOptionsStructured): Promise<AgentExecutor>;
/** @deprecated See {@link https://js.langchain.com/docs/modules/agents/agent_types/ | new agent creation docs}. */
export declare function initializeAgentExecutorWithOptions(tools: ToolInterface[], llm: BaseLanguageModelInterface, options?: InitializeAgentExecutorOptions): Promise<AgentExecutor>;
export {};
