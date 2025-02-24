"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOpenApiAgent = exports.OpenApiToolkit = exports.RequestsToolkit = void 0;
const tools_1 = require("@langchain/core/tools");
const executor_js_1 = require("../../executor.cjs");
const prompt_js_1 = require("./prompt.cjs");
const llm_chain_js_1 = require("../../../chains/llm_chain.cjs");
const index_js_1 = require("../../mrkl/index.cjs");
const requests_js_1 = require("../../../tools/requests.cjs");
const json_js_1 = require("../json/json.cjs");
/**
 * Represents a toolkit for making HTTP requests. It initializes the
 * request tools based on the provided headers.
 */
class RequestsToolkit extends tools_1.BaseToolkit {
    constructor(headers) {
        super();
        Object.defineProperty(this, "tools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.tools = [new requests_js_1.RequestsGetTool(headers), new requests_js_1.RequestsPostTool(headers)];
    }
}
exports.RequestsToolkit = RequestsToolkit;
/**
 * Extends the `RequestsToolkit` class and adds a dynamic tool for
 * exploring JSON data. It creates a JSON agent using the `JsonToolkit`
 * and the provided language model, and adds the JSON explorer tool to the
 * toolkit.
 * @example
 * ```typescript
 * const toolkit = new OpenApiToolkit(
 *   new JsonSpec({
 *   }),
 *   new ChatOpenAI({ temperature: 0 }),
 *   {
 *     "Content-Type": "application/json",
 *     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
 *   },
 * );
 *
 * const result = await toolkit.invoke({
 *   input:
 *     "Make a POST request to openai /completions. The prompt should be 'tell me a joke.'",
 * });
 * console.log(`Got output ${result.output}`);
 * ```
 */
class OpenApiToolkit extends RequestsToolkit {
    constructor(jsonSpec, llm, headers) {
        super(headers);
        const jsonAgent = (0, json_js_1.createJsonAgent)(llm, new json_js_1.JsonToolkit(jsonSpec));
        this.tools = [
            ...this.tools,
            new tools_1.DynamicTool({
                name: "json_explorer",
                func: async (input) => {
                    const result = await jsonAgent.call({ input });
                    return result.output;
                },
                description: prompt_js_1.JSON_EXPLORER_DESCRIPTION,
            }),
        ];
    }
}
exports.OpenApiToolkit = OpenApiToolkit;
/**
 * @deprecated Create a specific agent with a custom tool instead.
 *
 * Creates an OpenAPI agent using a language model, an OpenAPI toolkit,
 * and optional prompt arguments. It creates a prompt for the agent using
 * the OpenAPI tools and the provided prefix and suffix. It then creates a
 * ZeroShotAgent with the prompt and the OpenAPI tools, and returns an
 * AgentExecutor for executing the agent with the tools.
 * @param llm The language model to use.
 * @param openApiToolkit The OpenAPI toolkit to use.
 * @param args Optional arguments for creating the prompt.
 * @returns An AgentExecutor for executing the agent with the tools.
 *
 * @security **Security Notice** This agent provides access to external APIs.
 * Use with caution as this agent can make API calls with arbitrary headers.
 * Exposing this agent to users could lead to security vulnerabilities. Consider
 * limiting access to what endpoints it can hit, what actions can be taken, and
 * more.
 *
 * @link See https://js.langchain.com/docs/security for more information.
 */
function createOpenApiAgent(llm, openApiToolkit, args) {
    const { prefix = prompt_js_1.OPENAPI_PREFIX, suffix = prompt_js_1.OPENAPI_SUFFIX, inputVariables = ["input", "agent_scratchpad"], } = args ?? {};
    const { tools } = openApiToolkit;
    const prompt = index_js_1.ZeroShotAgent.createPrompt(tools, {
        prefix,
        suffix,
        inputVariables,
    });
    const chain = new llm_chain_js_1.LLMChain({
        prompt,
        llm,
    });
    const toolNames = tools.map((tool) => tool.name);
    const agent = new index_js_1.ZeroShotAgent({ llmChain: chain, allowedTools: toolNames });
    return executor_js_1.AgentExecutor.fromAgentAndTools({
        agent,
        tools,
        returnIntermediateSteps: true,
    });
}
exports.createOpenApiAgent = createOpenApiAgent;
