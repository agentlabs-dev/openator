"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._convertToOpenAITool = void 0;
const function_calling_1 = require("@langchain/core/utils/function_calling");
const zod_1 = require("openai/helpers/zod");
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
function _convertToOpenAITool(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
tool, fields) {
    let toolDef;
    if ((0, function_calling_1.isLangChainTool)(tool)) {
        const oaiToolDef = (0, zod_1.zodFunction)({
            name: tool.name,
            parameters: tool.schema,
            description: tool.description,
        });
        if (!oaiToolDef.function.parameters) {
            // Fallback to the `convertToOpenAIFunction` util if the parameters are not defined.
            toolDef = {
                type: "function",
                function: (0, function_calling_1.convertToOpenAIFunction)(tool, fields),
            };
        }
        else {
            toolDef = {
                type: oaiToolDef.type,
                function: {
                    name: oaiToolDef.function.name,
                    description: oaiToolDef.function.description,
                    parameters: oaiToolDef.function.parameters,
                    ...(fields?.strict !== undefined ? { strict: fields.strict } : {}),
                },
            };
        }
    }
    else {
        toolDef = tool;
    }
    if (fields?.strict !== undefined) {
        toolDef.function.strict = fields.strict;
    }
    return toolDef;
}
exports._convertToOpenAITool = _convertToOpenAITool;
