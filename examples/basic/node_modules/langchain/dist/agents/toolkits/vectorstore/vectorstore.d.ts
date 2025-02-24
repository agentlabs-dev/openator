import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import type { VectorStoreInterface } from "@langchain/core/vectorstores";
import { ToolInterface, BaseToolkit } from "@langchain/core/tools";
import { ZeroShotCreatePromptArgs } from "../../mrkl/index.js";
import { AgentExecutor } from "../../executor.js";
/**
 * Interface that defines the information about a vector store, including
 * the vector store itself, its name, and description.
 */
export interface VectorStoreInfo {
    vectorStore: VectorStoreInterface;
    name: string;
    description: string;
}
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
export declare class VectorStoreToolkit extends BaseToolkit {
    tools: ToolInterface[];
    llm: BaseLanguageModelInterface;
    constructor(vectorStoreInfo: VectorStoreInfo, llm: BaseLanguageModelInterface);
}
/**
 * Class representing a toolkit for working with multiple vector stores.
 * It initializes multiple vector store QA tools based on the provided
 * vector store information and language model.
 */
export declare class VectorStoreRouterToolkit extends BaseToolkit {
    tools: ToolInterface[];
    vectorStoreInfos: VectorStoreInfo[];
    llm: BaseLanguageModelInterface;
    constructor(vectorStoreInfos: VectorStoreInfo[], llm: BaseLanguageModelInterface);
}
/** @deprecated Create a specific agent with a custom tool instead. */
export declare function createVectorStoreAgent(llm: BaseLanguageModelInterface, toolkit: VectorStoreToolkit, args?: ZeroShotCreatePromptArgs): AgentExecutor;
/** @deprecated Create a specific agent with a custom tool instead. */
export declare function createVectorStoreRouterAgent(llm: BaseLanguageModelInterface, toolkit: VectorStoreRouterToolkit, args?: ZeroShotCreatePromptArgs): AgentExecutor;
