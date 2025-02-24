import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import { type ToolInterface, BaseToolkit } from "@langchain/core/tools";
import { JsonSpec } from "../../../tools/json.js";
import { ZeroShotCreatePromptArgs } from "../../mrkl/index.js";
import { AgentExecutor } from "../../executor.js";
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
export declare class JsonToolkit extends BaseToolkit {
    jsonSpec: JsonSpec;
    tools: ToolInterface[];
    constructor(jsonSpec: JsonSpec);
}
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
export declare function createJsonAgent(llm: BaseLanguageModelInterface, toolkit: JsonToolkit, args?: ZeroShotCreatePromptArgs): AgentExecutor;
