"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTextDescriptionAndArgs = exports.renderTextDescription = void 0;
const zod_to_json_schema_1 = require("zod-to-json-schema");
const base_1 = require("@langchain/core/language_models/base");
/**
 * Render the tool name and description in plain text.
 *
 * Output will be in the format of:
 * ```
 * search: This tool is used for search
 * calculator: This tool is used for math
 * ```
 * @param tools
 * @returns a string of all tools and their descriptions
 */
function renderTextDescription(tools) {
    if (tools.every(base_1.isOpenAITool)) {
        return tools
            .map((tool) => `${tool.function.name}${tool.function.description ? `: ${tool.function.description}` : ""}`)
            .join("\n");
    }
    return tools
        .map((tool) => `${tool.name}: ${tool.description}`)
        .join("\n");
}
exports.renderTextDescription = renderTextDescription;
/**
 * Render the tool name, description, and args in plain text.
 * Output will be in the format of:'
 * ```
 * search: This tool is used for search, args: {"query": {"type": "string"}}
 * calculator: This tool is used for math,
 * args: {"expression": {"type": "string"}}
 * ```
 * @param tools
 * @returns a string of all tools, their descriptions and a stringified version of their schemas
 */
function renderTextDescriptionAndArgs(tools) {
    if (tools.every(base_1.isOpenAITool)) {
        return tools
            .map((tool) => `${tool.function.name}${tool.function.description ? `: ${tool.function.description}` : ""}, args: ${JSON.stringify(tool.function.parameters)}`)
            .join("\n");
    }
    return tools
        .map((tool) => `${tool.name}: ${tool.description}, args: ${JSON.stringify((0, zod_to_json_schema_1.zodToJsonSchema)(tool.schema).properties)}`)
        .join("\n");
}
exports.renderTextDescriptionAndArgs = renderTextDescriptionAndArgs;
