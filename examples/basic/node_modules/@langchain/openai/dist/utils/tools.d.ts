import { OpenAI as OpenAIClient } from "openai";
import { BindToolsInput } from "@langchain/core/language_models/chat_models";
/**
 * Formats a tool in either OpenAI format, or LangChain structured tool format
 * into an OpenAI tool format. If the tool is already in OpenAI format, return without
 * any changes. If it is in LangChain structured tool format, convert it to OpenAI tool format
 * using OpenAI's `zodFunction` util, falling back to `convertToOpenAIFunction` if the parameters
 * returned from the `zodFunction` util are not defined.
 *
 * @param {BindToolsInput} tool The tool to convert to an OpenAI tool.
 * @param {Object} [fields] Additional fields to add to the OpenAI tool.
 * @returns {ToolDefinition} The inputted tool in OpenAI tool format.
 */
export declare function _convertToOpenAITool(tool: BindToolsInput, fields?: {
    /**
     * If `true`, model output is guaranteed to exactly match the JSON Schema
     * provided in the function definition.
     */
    strict?: boolean;
}): OpenAIClient.ChatCompletionTool;
