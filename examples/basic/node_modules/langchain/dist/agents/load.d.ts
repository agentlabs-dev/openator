import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import type { ToolInterface } from "@langchain/core/tools";
import { Agent } from "./agent.js";
/** @deprecated */
export declare const loadAgent: (uri: string, llmAndTools?: {
    llm?: BaseLanguageModelInterface;
    tools?: ToolInterface[];
}) => Promise<Agent>;
