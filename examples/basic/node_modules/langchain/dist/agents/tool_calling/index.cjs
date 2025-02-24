"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToolCallingAgent = void 0;
const runnables_1 = require("@langchain/core/runnables");
const agent_js_1 = require("../agent.cjs");
const output_parser_js_1 = require("./output_parser.cjs");
const tool_calling_js_1 = require("../format_scratchpad/tool_calling.cjs");
function _isBaseChatModel(x) {
    const model = x;
    return (typeof model._modelType === "function" &&
        model._modelType() === "base_chat_model");
}
/**
 * Create an agent that uses tools.
 * @param params Params required to create the agent. Includes an LLM, tools, and prompt.
 * @returns A runnable sequence representing an agent. It takes as input all the same input
 *     variables as the prompt passed in does. It returns as output either an
 *     AgentAction or AgentFinish.
 * @example
 * ```typescript
 * import { ChatAnthropic } from "@langchain/anthropic";
 * import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
 * import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
 *
 * const prompt = ChatPromptTemplate.fromMessages(
 *   [
 *     ["system", "You are a helpful assistant"],
 *     ["placeholder", "{chat_history}"],
 *     ["human", "{input}"],
 *     ["placeholder", "{agent_scratchpad}"],
 *   ]
 * );
 *
 *
 * const llm = new ChatAnthropic({
 *   modelName: "claude-3-opus-20240229",
 *   temperature: 0,
 * });
 *
 * // Define the tools the agent will have access to.
 * const tools = [...];
 *
 * const agent = createToolCallingAgent({ llm, tools, prompt });
 *
 * const agentExecutor = new AgentExecutor({ agent, tools });
 *
 * const result = await agentExecutor.invoke({input: "what is LangChain?"});
 *
 * // Using with chat history
 * import { AIMessage, HumanMessage } from "@langchain/core/messages";
 *
 * const result2 = await agentExecutor.invoke(
 *   {
 *     input: "what's my name?",
 *     chat_history: [
 *       new HumanMessage({content: "hi! my name is bob"}),
 *       new AIMessage({content: "Hello Bob! How can I assist you today?"}),
 *     ],
 *   }
 * );
 * ```
 */
function createToolCallingAgent({ llm, tools, prompt, streamRunnable, }) {
    if (!prompt.inputVariables.includes("agent_scratchpad")) {
        throw new Error([
            `Prompt must have an input variable named "agent_scratchpad".`,
            `Found ${JSON.stringify(prompt.inputVariables)} instead.`,
        ].join("\n"));
    }
    let modelWithTools;
    if (_isBaseChatModel(llm)) {
        if (llm.bindTools === undefined) {
            throw new Error(`This agent requires that the "bind_tools()" method be implemented on the input model.`);
        }
        modelWithTools = llm.bindTools(tools);
    }
    else {
        modelWithTools = llm;
    }
    const agent = agent_js_1.AgentRunnableSequence.fromRunnables([
        runnables_1.RunnablePassthrough.assign({
            agent_scratchpad: (input) => (0, tool_calling_js_1.formatToToolMessages)(input.steps),
        }),
        prompt,
        modelWithTools,
        new output_parser_js_1.ToolCallingAgentOutputParser(),
    ], {
        name: "ToolCallingAgent",
        streamRunnable,
        singleAction: false,
    });
    return agent;
}
exports.createToolCallingAgent = createToolCallingAgent;
