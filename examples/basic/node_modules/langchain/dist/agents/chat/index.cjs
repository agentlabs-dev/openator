"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatAgent = void 0;
const prompts_1 = require("@langchain/core/prompts");
const llm_chain_js_1 = require("../../chains/llm_chain.cjs");
const agent_js_1 = require("../agent.cjs");
const outputParser_js_1 = require("./outputParser.cjs");
const prompt_js_1 = require("./prompt.cjs");
const DEFAULT_HUMAN_MESSAGE_TEMPLATE = "{input}\n\n{agent_scratchpad}";
/**
 * Agent for the MRKL chain.
 * @augments Agent
 *
 * @deprecated Use the {@link https://api.js.langchain.com/functions/langchain.agents.createStructuredChatAgent.html | createStructuredChatAgent method instead}.
 */
class ChatAgent extends agent_js_1.Agent {
    static lc_name() {
        return "ChatAgent";
    }
    constructor(input) {
        const outputParser = input?.outputParser ?? ChatAgent.getDefaultOutputParser();
        super({ ...input, outputParser });
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "chat"]
        });
    }
    _agentType() {
        return "chat-zero-shot-react-description";
    }
    observationPrefix() {
        return "Observation: ";
    }
    llmPrefix() {
        return "Thought:";
    }
    _stop() {
        return ["Observation:"];
    }
    /**
     * Validates that all tools have descriptions. Throws an error if a tool
     * without a description is found.
     * @param tools Array of Tool instances to validate.
     * @returns void
     */
    static validateTools(tools) {
        const descriptionlessTool = tools.find((tool) => !tool.description);
        if (descriptionlessTool) {
            const msg = `Got a tool ${descriptionlessTool.name} without a description.` +
                ` This agent requires descriptions for all tools.`;
            throw new Error(msg);
        }
    }
    /**
     * Returns a default output parser for the ChatAgent.
     * @param _fields Optional OutputParserArgs to customize the output parser.
     * @returns ChatAgentOutputParser instance
     */
    static getDefaultOutputParser(_fields) {
        return new outputParser_js_1.ChatAgentOutputParser();
    }
    /**
     * Constructs the agent's scratchpad, which is a string representation of
     * the agent's previous steps.
     * @param steps Array of AgentStep instances representing the agent's previous steps.
     * @returns Promise resolving to a string representing the agent's scratchpad.
     */
    async constructScratchPad(steps) {
        const agentScratchpad = await super.constructScratchPad(steps);
        if (agentScratchpad) {
            return `This was your previous work (but I haven't seen any of it! I only see what you return as final answer):\n${agentScratchpad}`;
        }
        return agentScratchpad;
    }
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
    static createPrompt(tools, args) {
        const { prefix = prompt_js_1.PREFIX, suffix = prompt_js_1.SUFFIX, humanMessageTemplate = DEFAULT_HUMAN_MESSAGE_TEMPLATE, formatInstructions = prompt_js_1.FORMAT_INSTRUCTIONS, } = args ?? {};
        const toolStrings = tools
            .map((tool) => `${tool.name}: ${tool.description}`)
            .join("\n");
        const template = [prefix, toolStrings, formatInstructions, suffix].join("\n\n");
        const messages = [
            prompts_1.SystemMessagePromptTemplate.fromTemplate(template),
            prompts_1.HumanMessagePromptTemplate.fromTemplate(humanMessageTemplate),
        ];
        return prompts_1.ChatPromptTemplate.fromMessages(messages);
    }
    /**
     * Creates a ChatAgent instance using a language model, tools, and
     * optional arguments.
     * @param llm BaseLanguageModelInterface instance to use in the agent.
     * @param tools Array of Tool instances to include in the agent.
     * @param args Optional arguments to customize the agent and prompt.
     * @returns ChatAgent instance
     */
    static fromLLMAndTools(llm, tools, args) {
        ChatAgent.validateTools(tools);
        const prompt = ChatAgent.createPrompt(tools, args);
        const chain = new llm_chain_js_1.LLMChain({
            prompt,
            llm,
            callbacks: args?.callbacks ?? args?.callbackManager,
        });
        const outputParser = args?.outputParser ?? ChatAgent.getDefaultOutputParser();
        return new ChatAgent({
            llmChain: chain,
            outputParser,
            allowedTools: tools.map((t) => t.name),
        });
    }
}
exports.ChatAgent = ChatAgent;
