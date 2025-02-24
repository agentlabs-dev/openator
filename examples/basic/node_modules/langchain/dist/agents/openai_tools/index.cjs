"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOpenAIToolsAgent = exports.OpenAIToolsAgentOutputParser = void 0;
const runnables_1 = require("@langchain/core/runnables");
const function_calling_1 = require("@langchain/core/utils/function_calling");
const openai_tools_js_1 = require("../format_scratchpad/openai_tools.cjs");
const output_parser_js_1 = require("./output_parser.cjs");
Object.defineProperty(exports, "OpenAIToolsAgentOutputParser", { enumerable: true, get: function () { return output_parser_js_1.OpenAIToolsAgentOutputParser; } });
const agent_js_1 = require("../agent.cjs");
/**
 * Create an agent that uses OpenAI-style tool calling.
 * @param params Params required to create the agent. Includes an LLM, tools, and prompt.
 * @returns A runnable sequence representing an agent. It takes as input all the same input
 *     variables as the prompt passed in does. It returns as output either an
 *     AgentAction or AgentFinish.
 *
 * @example
 * ```typescript
 * import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
 * import { pull } from "langchain/hub";
 * import type { ChatPromptTemplate } from "@langchain/core/prompts";
 * import { AIMessage, HumanMessage } from "@langchain/core/messages";
 *
 * import { ChatOpenAI } from "@langchain/openai";
 *
 * // Define the tools the agent will have access to.
 * const tools = [...];
 *
 * // Get the prompt to use - you can modify this!
 * // If you want to see the prompt in full, you can at:
 * // https://smith.langchain.com/hub/hwchase17/openai-tools-agent
 * const prompt = await pull<ChatPromptTemplate>(
 *   "hwchase17/openai-tools-agent"
 * );
 *
 * const llm = new ChatOpenAI({
 *   temperature: 0,
 *   modelName: "gpt-3.5-turbo-1106",
 * });
 *
 * const agent = await createOpenAIToolsAgent({
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
 *   chat_history: [
 *     new HumanMessage("hi! my name is cob"),
 *     new AIMessage("Hello Cob! How can I assist you today?"),
 *   ],
 * });
 * ```
 */
async function createOpenAIToolsAgent({ llm, tools, prompt, streamRunnable, }) {
    if (!prompt.inputVariables.includes("agent_scratchpad")) {
        throw new Error([
            `Prompt must have an input variable named "agent_scratchpad".`,
            `Found ${JSON.stringify(prompt.inputVariables)} instead.`,
        ].join("\n"));
    }
    const modelWithTools = llm.bind({
        tools: tools.map((tool) => (0, function_calling_1.convertToOpenAITool)(tool)),
    });
    const agent = agent_js_1.AgentRunnableSequence.fromRunnables([
        runnables_1.RunnablePassthrough.assign({
            agent_scratchpad: (input) => (0, openai_tools_js_1.formatToOpenAIToolMessages)(input.steps),
        }),
        prompt,
        modelWithTools,
        new output_parser_js_1.OpenAIToolsAgentOutputParser(),
    ], {
        name: "OpenAIToolsAgent",
        streamRunnable,
        singleAction: false,
    });
    return agent;
}
exports.createOpenAIToolsAgent = createOpenAIToolsAgent;
