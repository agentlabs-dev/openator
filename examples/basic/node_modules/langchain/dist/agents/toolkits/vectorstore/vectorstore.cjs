"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVectorStoreRouterAgent = exports.createVectorStoreAgent = exports.VectorStoreRouterToolkit = exports.VectorStoreToolkit = void 0;
const tools_1 = require("@langchain/core/tools");
const vectorstore_js_1 = require("../../../tools/vectorstore.cjs");
const index_js_1 = require("../../mrkl/index.cjs");
const prompt_js_1 = require("./prompt.cjs");
const prompt_js_2 = require("../../mrkl/prompt.cjs");
const llm_chain_js_1 = require("../../../chains/llm_chain.cjs");
const executor_js_1 = require("../../executor.cjs");
/**
 * Class representing a toolkit for working with a single vector store. It
 * initializes the vector store QA tool based on the provided vector store
 * information and language model.
 * @example
 * ```typescript
 * const toolkit = new VectorStoreToolkit(
 *   {
 *     name: "state_of_union_address",
 *     description: "the most recent state of the Union address",
 *     vectorStore: new HNSWLib(),
 *   },
 *   new ChatOpenAI({ temperature: 0 }),
 * );
 * const result = await toolkit.invoke({
 *   input:
 *     "What did biden say about Ketanji Brown Jackson in the state of the union address?",
 * });
 * console.log(`Got output ${result.output}`);
 * ```
 */
class VectorStoreToolkit extends tools_1.BaseToolkit {
    constructor(vectorStoreInfo, llm) {
        super();
        Object.defineProperty(this, "tools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "llm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const description = vectorstore_js_1.VectorStoreQATool.getDescription(vectorStoreInfo.name, vectorStoreInfo.description);
        this.llm = llm;
        this.tools = [
            new vectorstore_js_1.VectorStoreQATool(vectorStoreInfo.name, description, {
                vectorStore: vectorStoreInfo.vectorStore,
                llm: this.llm,
            }),
        ];
    }
}
exports.VectorStoreToolkit = VectorStoreToolkit;
/**
 * Class representing a toolkit for working with multiple vector stores.
 * It initializes multiple vector store QA tools based on the provided
 * vector store information and language model.
 */
class VectorStoreRouterToolkit extends tools_1.BaseToolkit {
    constructor(vectorStoreInfos, llm) {
        super();
        Object.defineProperty(this, "tools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "vectorStoreInfos", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "llm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.llm = llm;
        this.vectorStoreInfos = vectorStoreInfos;
        this.tools = vectorStoreInfos.map((vectorStoreInfo) => {
            const description = vectorstore_js_1.VectorStoreQATool.getDescription(vectorStoreInfo.name, vectorStoreInfo.description);
            return new vectorstore_js_1.VectorStoreQATool(vectorStoreInfo.name, description, {
                vectorStore: vectorStoreInfo.vectorStore,
                llm: this.llm,
            });
        });
    }
}
exports.VectorStoreRouterToolkit = VectorStoreRouterToolkit;
/** @deprecated Create a specific agent with a custom tool instead. */
function createVectorStoreAgent(llm, toolkit, args) {
    const { prefix = prompt_js_1.VECTOR_PREFIX, suffix = prompt_js_2.SUFFIX, inputVariables = ["input", "agent_scratchpad"], } = args ?? {};
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
exports.createVectorStoreAgent = createVectorStoreAgent;
/** @deprecated Create a specific agent with a custom tool instead. */
function createVectorStoreRouterAgent(llm, toolkit, args) {
    const { prefix = prompt_js_1.VECTOR_ROUTER_PREFIX, suffix = prompt_js_2.SUFFIX, inputVariables = ["input", "agent_scratchpad"], } = args ?? {};
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
exports.createVectorStoreRouterAgent = createVectorStoreRouterAgent;
