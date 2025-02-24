"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJsonAgent = exports.JsonToolkit = void 0;
const tools_1 = require("@langchain/core/tools");
const json_js_1 = require("../../../tools/json.cjs");
const prompt_js_1 = require("./prompt.cjs");
const llm_chain_js_1 = require("../../../chains/llm_chain.cjs");
const index_js_1 = require("../../mrkl/index.cjs");
const executor_js_1 = require("../../executor.cjs");
/**
 * Represents a toolkit for working with JSON data. It initializes the
 * JSON tools based on the provided JSON specification.
 * @example
 * ```typescript
 * const toolkit = new JsonToolkit(new JsonSpec());
 * const executor = createJsonAgent(model, toolkit);
 * const result = await executor.invoke({
 *   input: 'What are the required parameters in the request body to the /completions endpoint?'
 * });
 * ```
 */
class JsonToolkit extends tools_1.BaseToolkit {
    constructor(jsonSpec) {
        super();
        Object.defineProperty(this, "jsonSpec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: jsonSpec
        });
        Object.defineProperty(this, "tools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.tools = [
            new json_js_1.JsonListKeysTool(jsonSpec),
            new json_js_1.JsonGetValueTool(jsonSpec),
        ];
    }
}
exports.JsonToolkit = JsonToolkit;
/**
 * @deprecated Create a specific agent with a custom tool instead.
 *
 * Creates a JSON agent using a language model, a JSON toolkit, and
 * optional prompt arguments. It creates a prompt for the agent using the
 * JSON tools and the provided prefix and suffix. It then creates a
 * ZeroShotAgent with the prompt and the JSON tools, and returns an
 * AgentExecutor for executing the agent with the tools.
 * @param llm The language model used to create the JSON agent.
 * @param toolkit The JSON toolkit used to create the JSON agent.
 * @param args Optional prompt arguments used to create the JSON agent.
 * @returns An AgentExecutor for executing the created JSON agent with the tools.
 */
function createJsonAgent(llm, toolkit, args) {
    const { prefix = prompt_js_1.JSON_PREFIX, suffix = prompt_js_1.JSON_SUFFIX, inputVariables = ["input", "agent_scratchpad"], } = args ?? {};
    const { tools } = toolkit;
    const prompt = index_js_1.ZeroShotAgent.createPrompt(tools, {
        prefix,
        suffix,
        inputVariables,
    });
    const chain = new llm_chain_js_1.LLMChain({ prompt, llm });
    const agent = new index_js_1.ZeroShotAgent({
        llmChain: chain,
        allowedTools: tools.map((t) => t.name),
    });
    return executor_js_1.AgentExecutor.fromAgentAndTools({
        agent,
        tools,
        returnIntermediateSteps: true,
    });
}
exports.createJsonAgent = createJsonAgent;
