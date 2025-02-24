"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOpenAIFunctionsAgent = exports.OpenAIAgent = exports._formatIntermediateSteps = void 0;
const runnables_1 = require("@langchain/core/runnables");
const function_calling_1 = require("@langchain/core/utils/function_calling");
const messages_1 = require("@langchain/core/messages");
const prompts_1 = require("@langchain/core/prompts");
const agent_js_1 = require("../agent.cjs");
const prompt_js_1 = require("./prompt.cjs");
const llm_chain_js_1 = require("../../chains/llm_chain.cjs");
const output_parser_js_1 = require("../openai/output_parser.cjs");
const openai_functions_js_1 = require("../format_scratchpad/openai_functions.cjs");
/**
 * Checks if the given action is a FunctionsAgentAction.
 * @param action The action to check.
 * @returns True if the action is a FunctionsAgentAction, false otherwise.
 */
function isFunctionsAgentAction(action) {
    return action.messageLog !== undefined;
}
function _convertAgentStepToMessages(action, observation) {
    if (isFunctionsAgentAction(action) && action.messageLog !== undefined) {
        return action.messageLog?.concat(new messages_1.FunctionMessage(observation, action.tool));
    }
    else {
        return [new messages_1.AIMessage(action.log)];
    }
}
function _formatIntermediateSteps(intermediateSteps) {
    return intermediateSteps.flatMap(({ action, observation }) => _convertAgentStepToMessages(action, observation));
}
exports._formatIntermediateSteps = _formatIntermediateSteps;
/**
 * Class representing an agent for the OpenAI chat model in LangChain. It
 * extends the Agent class and provides additional functionality specific
 * to the OpenAIAgent type.
 *
 * @deprecated Use the {@link https://api.js.langchain.com/functions/langchain.agents.createOpenAIFunctionsAgent.html | createOpenAIFunctionsAgent method instead}.
 */
class OpenAIAgent extends agent_js_1.Agent {
    static lc_name() {
        return "OpenAIAgent";
    }
    _agentType() {
        return "openai-functions";
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
    constructor(input) {
        super({ ...input, outputParser: undefined });
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "openai"]
        });
        Object.defineProperty(this, "tools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new output_parser_js_1.OpenAIFunctionsAgentOutputParser()
        });
        this.tools = input.tools;
    }
    /**
     * Creates a prompt for the OpenAIAgent using the provided tools and
     * fields.
     * @param _tools The tools to be used in the prompt.
     * @param fields Optional fields for creating the prompt.
     * @returns A BasePromptTemplate object representing the created prompt.
     */
    static createPrompt(_tools, fields) {
        const { prefix = prompt_js_1.PREFIX } = fields || {};
        return prompts_1.ChatPromptTemplate.fromMessages([
            prompts_1.SystemMessagePromptTemplate.fromTemplate(prefix),
            new prompts_1.MessagesPlaceholder("chat_history"),
            prompts_1.HumanMessagePromptTemplate.fromTemplate("{input}"),
            new prompts_1.MessagesPlaceholder("agent_scratchpad"),
        ]);
    }
    /**
     * Creates an OpenAIAgent from a BaseLanguageModel and a list of tools.
     * @param llm The BaseLanguageModel to use.
     * @param tools The tools to be used by the agent.
     * @param args Optional arguments for creating the agent.
     * @returns An instance of OpenAIAgent.
     */
    static fromLLMAndTools(llm, tools, args) {
        OpenAIAgent.validateTools(tools);
        if (llm._modelType() !== "base_chat_model" || llm._llmType() !== "openai") {
            throw new Error("OpenAIAgent requires an OpenAI chat model");
        }
        const prompt = OpenAIAgent.createPrompt(tools, args);
        const chain = new llm_chain_js_1.LLMChain({
            prompt,
            llm,
            callbacks: args?.callbacks,
        });
        return new OpenAIAgent({
            llmChain: chain,
            allowedTools: tools.map((t) => t.name),
            tools,
        });
    }
    /**
     * Constructs a scratch pad from a list of agent steps.
     * @param steps The steps to include in the scratch pad.
     * @returns A string or a list of BaseMessages representing the constructed scratch pad.
     */
    async constructScratchPad(steps) {
        return _formatIntermediateSteps(steps);
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
        // Add scratchpad and stop to inputs
        const thoughts = await this.constructScratchPad(steps);
        const newInputs = {
            ...inputs,
            agent_scratchpad: thoughts,
        };
        if (this._stop().length !== 0) {
            newInputs.stop = this._stop();
        }
        // Split inputs between prompt and llm
        const llm = this.llmChain.llm;
        const valuesForPrompt = { ...newInputs };
        const valuesForLLM = {
            functions: this.tools.map((tool) => (0, function_calling_1.convertToOpenAIFunction)(tool)),
        };
        const callKeys = "callKeys" in this.llmChain.llm ? this.llmChain.llm.callKeys : [];
        for (const key of callKeys) {
            if (key in inputs) {
                valuesForLLM[key] =
                    inputs[key];
                delete valuesForPrompt[key];
            }
        }
        const promptValue = await this.llmChain.prompt.formatPromptValue(valuesForPrompt);
        const message = await llm.invoke(promptValue.toChatMessages(), {
            ...valuesForLLM,
            callbacks: callbackManager,
        });
        return this.outputParser.parseAIMessage(message);
    }
}
exports.OpenAIAgent = OpenAIAgent;
/**
 * Create an agent that uses OpenAI-style function calling.
 * @param params Params required to create the agent. Includes an LLM, tools, and prompt.
 * @returns A runnable sequence representing an agent. It takes as input all the same input
 *     variables as the prompt passed in does. It returns as output either an
 *     AgentAction or AgentFinish.
 *
 * @example
 * ```typescript
 * import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
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
 * // https://smith.langchain.com/hub/hwchase17/openai-functions-agent
 * const prompt = await pull<ChatPromptTemplate>(
 *   "hwchase17/openai-functions-agent"
 * );
 *
 * const llm = new ChatOpenAI({
 *   temperature: 0,
 * });
 *
 * const agent = await createOpenAIFunctionsAgent({
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
async function createOpenAIFunctionsAgent({ llm, tools, prompt, streamRunnable, }) {
    if (!prompt.inputVariables.includes("agent_scratchpad")) {
        throw new Error([
            `Prompt must have an input variable named "agent_scratchpad".`,
            `Found ${JSON.stringify(prompt.inputVariables)} instead.`,
        ].join("\n"));
    }
    const llmWithTools = llm.bind({
        functions: tools.map((tool) => (0, function_calling_1.convertToOpenAIFunction)(tool)),
    });
    const agent = agent_js_1.AgentRunnableSequence.fromRunnables([
        runnables_1.RunnablePassthrough.assign({
            agent_scratchpad: (input) => (0, openai_functions_js_1.formatToOpenAIFunctionMessages)(input.steps),
        }),
        prompt,
        llmWithTools,
        new output_parser_js_1.OpenAIFunctionsAgentOutputParser(),
    ], {
        name: "OpenAIFunctionsAgent",
        streamRunnable,
        singleAction: true,
    });
    return agent;
}
exports.createOpenAIFunctionsAgent = createOpenAIFunctionsAgent;
