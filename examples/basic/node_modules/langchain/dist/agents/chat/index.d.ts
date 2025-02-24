import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import type { ToolInterface } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { AgentStep } from "@langchain/core/agents";
import { Optional } from "../../types/type-utils.js";
import { Agent, AgentArgs, OutputParserArgs } from "../agent.js";
import { AgentInput } from "../types.js";
import { ChatAgentOutputParser } from "./outputParser.js";
/**
 * Interface for arguments used to create a chat prompt.
 * @deprecated
 */
export interface ChatCreatePromptArgs {
    /** String to put after the list of tools. */
    suffix?: string;
    /** String to put before the list of tools. */
    prefix?: string;
    /** String to use directly as the human message template. */
    humanMessageTemplate?: string;
    /** Formattable string to use as the instructions template. */
    formatInstructions?: string;
    /** List of input variables the final prompt will expect. */
    inputVariables?: string[];
}
/**
 * Type for input data for creating a ChatAgent, extending AgentInput with
 * optional 'outputParser'.
 *
 * @deprecated
 */
export type ChatAgentInput = Optional<AgentInput, "outputParser">;
/**
 * Agent for the MRKL chain.
 * @augments Agent
 *
 * @deprecated Use the {@link https://api.js.langchain.com/functions/langchain.agents.createStructuredChatAgent.html | createStructuredChatAgent method instead}.
 */
export declare class ChatAgent extends Agent {
    static lc_name(): string;
    lc_namespace: string[];
    ToolType: ToolInterface;
    constructor(input: ChatAgentInput);
    _agentType(): "chat-zero-shot-react-description";
    observationPrefix(): string;
    llmPrefix(): string;
    _stop(): string[];
    /**
     * Validates that all tools have descriptions. Throws an error if a tool
     * without a description is found.
     * @param tools Array of Tool instances to validate.
     * @returns void
     */
    static validateTools(tools: ToolInterface[]): void;
    /**
     * Returns a default output parser for the ChatAgent.
     * @param _fields Optional OutputParserArgs to customize the output parser.
     * @returns ChatAgentOutputParser instance
     */
    static getDefaultOutputParser(_fields?: OutputParserArgs): ChatAgentOutputParser;
    /**
     * Constructs the agent's scratchpad, which is a string representation of
     * the agent's previous steps.
     * @param steps Array of AgentStep instances representing the agent's previous steps.
     * @returns Promise resolving to a string representing the agent's scratchpad.
     */
    constructScratchPad(steps: AgentStep[]): Promise<string>;
    /**
     * Create prompt in the style of the zero shot agent.
     *
     * @param tools - List of tools the agent will have access to, used to format the prompt.
     * @param args - Arguments to create the prompt with.
     * @param args.suffix - String to put after the list of tools.
     * @param args.prefix - String to put before the list of tools.
     * @param args.humanMessageTemplate - String to use directly as the human message template
     * @param args.formatInstructions - Formattable string to use as the instructions template
     */
    static createPrompt(tools: ToolInterface[], args?: ChatCreatePromptArgs): ChatPromptTemplate<any, any>;
    /**
     * Creates a ChatAgent instance using a language model, tools, and
     * optional arguments.
     * @param llm BaseLanguageModelInterface instance to use in the agent.
     * @param tools Array of Tool instances to include in the agent.
     * @param args Optional arguments to customize the agent and prompt.
     * @returns ChatAgent instance
     */
    static fromLLMAndTools(llm: BaseLanguageModelInterface, tools: ToolInterface[], args?: ChatCreatePromptArgs & AgentArgs): ChatAgent;
}
