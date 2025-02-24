"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createXmlAgent = exports.XMLAgent = void 0;
const runnables_1 = require("@langchain/core/runnables");
const prompts_1 = require("@langchain/core/prompts");
const llm_chain_js_1 = require("../../chains/llm_chain.cjs");
const agent_js_1 = require("../agent.cjs");
const prompt_js_1 = require("./prompt.cjs");
const output_parser_js_1 = require("./output_parser.cjs");
const render_js_1 = require("../../tools/render.cjs");
const xml_js_1 = require("../format_scratchpad/xml.cjs");
/**
 * Class that represents an agent that uses XML tags.
 *
 * @deprecated Use the {@link https://api.js.langchain.com/functions/langchain.agents.createXmlAgent.html | createXmlAgent method instead}.
 */
class XMLAgent extends agent_js_1.BaseSingleActionAgent {
    static lc_name() {
        return "XMLAgent";
    }
    _agentType() {
        return "xml";
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "xml"]
        });
        Object.defineProperty(this, "tools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "llmChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new output_parser_js_1.XMLAgentOutputParser()
        });
        this.tools = fields.tools;
        this.llmChain = fields.llmChain;
    }
    get inputKeys() {
        return ["input"];
    }
    static createPrompt() {
        return prompts_1.ChatPromptTemplate.fromMessages([
            prompts_1.HumanMessagePromptTemplate.fromTemplate(prompt_js_1.AGENT_INSTRUCTIONS),
            prompts_1.AIMessagePromptTemplate.fromTemplate("{intermediate_steps}"),
        ]);
    }
    /**
     * Plans the next action or finish state of the agent based on the
     * provided steps, inputs, and optional callback manager.
     * @param steps The steps to consider in planning.
     * @param inputs The inputs to consider in planning.
     * @param callbackManager Optional CallbackManager to use in planning.
     * @returns A Promise that resolves to an AgentAction or AgentFinish object representing the planned action or finish state.
     */
    async plan(steps, inputs, callbackManager) {
        let log = "";
        for (const { action, observation } of steps) {
            log += `<tool>${action.tool}</tool><tool_input>${action.toolInput}</tool_input><observation>${observation}</observation>`;
        }
        let tools = "";
        for (const tool of this.tools) {
            tools += `${tool.name}: ${tool.description}\n`;
        }
        const _inputs = {
            intermediate_steps: log,
            tools,
            question: inputs.input,
            stop: ["</tool_input>", "</final_answer>"],
        };
        const response = await this.llmChain.call(_inputs, callbackManager);
        return this.outputParser.parse(response[this.llmChain.outputKey]);
    }
    /**
     * Creates an XMLAgent from a BaseLanguageModel and a list of tools.
     * @param llm The BaseLanguageModel to use.
     * @param tools The tools to be used by the agent.
     * @param args Optional arguments for creating the agent.
     * @returns An instance of XMLAgent.
     */
    static fromLLMAndTools(llm, tools, args) {
        const prompt = XMLAgent.createPrompt();
        const chain = new llm_chain_js_1.LLMChain({
            prompt,
            llm,
            callbacks: args?.callbacks,
        });
        return new XMLAgent({
            llmChain: chain,
            tools,
        });
    }
}
exports.XMLAgent = XMLAgent;
/**
 * Create an agent that uses XML to format its logic.
 * @param params Params required to create the agent. Includes an LLM, tools, and prompt.
 * @returns A runnable sequence representing an agent. It takes as input all the same input
 *     variables as the prompt passed in does. It returns as output either an
 *     AgentAction or AgentFinish.
 *
 * @example
 * ```typescript
 * import { AgentExecutor, createXmlAgent } from "langchain/agents";
 * import { pull } from "langchain/hub";
 * import type { PromptTemplate } from "@langchain/core/prompts";
 *
 * import { ChatAnthropic } from "@langchain/anthropic";
 *
 * // Define the tools the agent will have access to.
 * const tools = [...];
 *
 * // Get the prompt to use - you can modify this!
 * // If you want to see the prompt in full, you can at:
 * // https://smith.langchain.com/hub/hwchase17/xml-agent-convo
 * const prompt = await pull<PromptTemplate>("hwchase17/xml-agent-convo");
 *
 * const llm = new ChatAnthropic({
 *   temperature: 0,
 * });
 *
 * const agent = await createXmlAgent({
 *   llm,
 *   tools,
 *   prompt,
 * });
 *
 * const agentExecutor = new AgentExecutor({
 *   agent,
 *   tools,
 * });
 *
 * const result = await agentExecutor.invoke({
 *   input: "what is LangChain?",
 * });
 *
 * // With chat history
 * const result2 = await agentExecutor.invoke({
 *   input: "what's my name?",
 *   // Notice that chat_history is a string, since this prompt is aimed at LLMs, not chat models
 *   chat_history: "Human: Hi! My name is Cob\nAI: Hello Cob! Nice to meet you",
 * });
 * ```
 */
async function createXmlAgent({ llm, tools, prompt, streamRunnable, }) {
    const missingVariables = ["tools", "agent_scratchpad"].filter((v) => !prompt.inputVariables.includes(v));
    if (missingVariables.length > 0) {
        throw new Error(`Provided prompt is missing required input variables: ${JSON.stringify(missingVariables)}`);
    }
    const partialedPrompt = await prompt.partial({
        tools: (0, render_js_1.renderTextDescription)(tools),
    });
    // TODO: Add .bind to core runnable interface.
    const llmWithStop = llm.bind({
        stop: ["</tool_input>", "</final_answer>"],
    });
    const agent = agent_js_1.AgentRunnableSequence.fromRunnables([
        runnables_1.RunnablePassthrough.assign({
            agent_scratchpad: (input) => (0, xml_js_1.formatXml)(input.steps),
        }),
        partialedPrompt,
        llmWithStop,
        new output_parser_js_1.XMLAgentOutputParser(),
    ], {
        name: "XMLAgent",
        streamRunnable,
        singleAction: true,
    });
    return agent;
}
exports.createXmlAgent = createXmlAgent;
