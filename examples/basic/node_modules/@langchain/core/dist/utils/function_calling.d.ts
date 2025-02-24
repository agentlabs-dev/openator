import { StructuredToolInterface, StructuredToolParams } from "../tools/index.js";
import { FunctionDefinition, ToolDefinition } from "../language_models/base.js";
import { RunnableToolLike } from "../runnables/base.js";
/**
 * Formats a `StructuredTool` or `RunnableToolLike` instance into a format
 * that is compatible with OpenAI function calling. It uses the `zodToJsonSchema`
 * function to convert the schema of the `StructuredTool` or `RunnableToolLike`
 * into a JSON schema, which is then used as the parameters for the OpenAI function.
 *
 * @param {StructuredToolInterface | RunnableToolLike} tool The tool to convert to an OpenAI function.
 * @returns {FunctionDefinition} The inputted tool in OpenAI function format.
 */
export declare function convertToOpenAIFunction(tool: StructuredToolInterface | RunnableToolLike | StructuredToolParams, fields?: {
    /**
     * If `true`, model output is guaranteed to exactly match the JSON Schema
     * provided in the function definition.
     */
    strict?: boolean;
} | number): FunctionDefinition;
/**
 * Formats a `StructuredTool` or `RunnableToolLike` instance into a
 * format that is compatible with OpenAI tool calling. It uses the
 * `zodToJsonSchema` function to convert the schema of the `StructuredTool`
 * or `RunnableToolLike` into a JSON schema, which is then used as the
 * parameters for the OpenAI tool.
 *
 * @param {StructuredToolInterface | Record<string, any> | RunnableToolLike} tool The tool to convert to an OpenAI tool.
 * @returns {ToolDefinition} The inputted tool in OpenAI tool format.
 */
export declare function convertToOpenAITool(tool: StructuredToolInterface | Record<string, any> | RunnableToolLike, fields?: {
    /**
     * If `true`, model output is guaranteed to exactly match the JSON Schema
     * provided in the function definition.
     */
    strict?: boolean;
} | number): ToolDefinition;
/**
 * Confirm whether the inputted tool is an instance of `StructuredToolInterface`.
 *
 * @param {StructuredToolInterface | Record<string, any> | undefined} tool The tool to check if it is an instance of `StructuredToolInterface`.
 * @returns {tool is StructuredToolInterface} Whether the inputted tool is an instance of `StructuredToolInterface`.
 */
export declare function isStructuredTool(tool?: StructuredToolInterface | Record<string, any>): tool is StructuredToolInterface;
/**
 * Confirm whether the inputted tool is an instance of `RunnableToolLike`.
 *
 * @param {unknown | undefined} tool The tool to check if it is an instance of `RunnableToolLike`.
 * @returns {tool is RunnableToolLike} Whether the inputted tool is an instance of `RunnableToolLike`.
 */
export declare function isRunnableToolLike(tool?: unknown): tool is RunnableToolLike;
/**
 * Confirm whether or not the tool contains the necessary properties to be considered a `StructuredToolParams`.
 *
 * @param {unknown | undefined} tool The object to check if it is a `StructuredToolParams`.
 * @returns {tool is StructuredToolParams} Whether the inputted object is a `StructuredToolParams`.
 */
export declare function isStructuredToolParams(tool?: unknown): tool is StructuredToolParams;
/**
 * Whether or not the tool is one of StructuredTool, RunnableTool or StructuredToolParams.
 * It returns `is StructuredToolParams` since that is the most minimal interface of the three,
 * while still containing the necessary properties to be passed to a LLM for tool calling.
 *
 * @param {unknown | undefined} tool The tool to check if it is a LangChain tool.
 * @returns {tool is StructuredToolParams} Whether the inputted tool is a LangChain tool.
 */
export declare function isLangChainTool(tool?: unknown): tool is StructuredToolParams;
