import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import type { ToolInterface } from "@langchain/core/tools";
import type { SerializedAgentT, AgentInput } from "./types.js";
export declare const deserializeHelper: <T extends string, U extends Record<string, unknown>, V extends AgentInput, Z>(llm: BaseLanguageModelInterface | undefined, tools: ToolInterface[] | undefined, data: SerializedAgentT<T, U, V>, fromLLMAndTools: (llm: BaseLanguageModelInterface, tools: ToolInterface[], args: U) => Z, fromConstructor: (args: V) => Z) => Promise<Z>;
