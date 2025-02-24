"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLangChainTool = exports.isStructuredToolParams = exports.isRunnableToolLike = exports.isStructuredTool = exports.convertToOpenAITool = exports.convertToOpenAIFunction = void 0;
const zod_to_json_schema_1 = require("zod-to-json-schema");
const base_js_1 = require("../runnables/base.cjs");
const is_zod_schema_js_1 = require("./types/is_zod_schema.cjs");
/**
 * Formats a `StructuredTool` or `RunnableToolLike` instance into a format
 * that is compatible with OpenAI function calling. It uses the `zodToJsonSchema`
 * function to convert the schema of the `StructuredTool` or `RunnableToolLike`
 * into a JSON schema, which is then used as the parameters for the OpenAI function.
 *
 * @param {StructuredToolInterface | RunnableToolLike} tool The tool to convert to an OpenAI function.
 * @returns {FunctionDefinition} The inputted tool in OpenAI function format.
 */
function convertToOpenAIFunction(tool, fields) {
    // @TODO 0.3.0 Remove the `number` typing
    const fieldsCopy = typeof fields === "number" ? undefined : fields;
    return {
        name: tool.name,
        description: tool.description,
        parameters: (0, zod_to_json_schema_1.zodToJsonSchema)(tool.schema),
        // Do not include the `strict` field if it is `undefined`.
        ...(fieldsCopy?.strict !== undefined ? { strict: fieldsCopy.strict } : {}),
    };
}
exports.convertToOpenAIFunction = convertToOpenAIFunction;
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
function convertToOpenAITool(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
tool, fields) {
    // @TODO 0.3.0 Remove the `number` typing
    const fieldsCopy = typeof fields === "number" ? undefined : fields;
    let toolDef;
    if (isLangChainTool(tool)) {
        toolDef = {
            type: "function",
            function: convertToOpenAIFunction(tool),
        };
    }
    else {
        toolDef = tool;
    }
    if (fieldsCopy?.strict !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toolDef.function.strict = fieldsCopy.strict;
    }
    return toolDef;
}
exports.convertToOpenAITool = convertToOpenAITool;
/**
 * Confirm whether the inputted tool is an instance of `StructuredToolInterface`.
 *
 * @param {StructuredToolInterface | Record<string, any> | undefined} tool The tool to check if it is an instance of `StructuredToolInterface`.
 * @returns {tool is StructuredToolInterface} Whether the inputted tool is an instance of `StructuredToolInterface`.
 */
function isStructuredTool(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
tool) {
    return (tool !== undefined &&
        Array.isArray(tool.lc_namespace));
}
exports.isStructuredTool = isStructuredTool;
/**
 * Confirm whether the inputted tool is an instance of `RunnableToolLike`.
 *
 * @param {unknown | undefined} tool The tool to check if it is an instance of `RunnableToolLike`.
 * @returns {tool is RunnableToolLike} Whether the inputted tool is an instance of `RunnableToolLike`.
 */
function isRunnableToolLike(tool) {
    return (tool !== undefined &&
        base_js_1.Runnable.isRunnable(tool) &&
        "lc_name" in tool.constructor &&
        typeof tool.constructor.lc_name === "function" &&
        tool.constructor.lc_name() === "RunnableToolLike");
}
exports.isRunnableToolLike = isRunnableToolLike;
/**
 * Confirm whether or not the tool contains the necessary properties to be considered a `StructuredToolParams`.
 *
 * @param {unknown | undefined} tool The object to check if it is a `StructuredToolParams`.
 * @returns {tool is StructuredToolParams} Whether the inputted object is a `StructuredToolParams`.
 */
function isStructuredToolParams(tool) {
    return (!!tool &&
        typeof tool === "object" &&
        "name" in tool &&
        "schema" in tool &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (0, is_zod_schema_js_1.isZodSchema)(tool.schema));
}
exports.isStructuredToolParams = isStructuredToolParams;
/**
 * Whether or not the tool is one of StructuredTool, RunnableTool or StructuredToolParams.
 * It returns `is StructuredToolParams` since that is the most minimal interface of the three,
 * while still containing the necessary properties to be passed to a LLM for tool calling.
 *
 * @param {unknown | undefined} tool The tool to check if it is a LangChain tool.
 * @returns {tool is StructuredToolParams} Whether the inputted tool is a LangChain tool.
 */
function isLangChainTool(tool) {
    return (isStructuredToolParams(tool) ||
        isRunnableToolLike(tool) ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        isStructuredTool(tool));
}
exports.isLangChainTool = isLangChainTool;
