"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatToOpenAIAssistantTool = exports.formatToOpenAITool = exports.formatToOpenAIFunction = void 0;
const zod_to_json_schema_1 = require("zod-to-json-schema");
const function_calling_1 = require("@langchain/core/utils/function_calling");
Object.defineProperty(exports, "formatToOpenAIFunction", { enumerable: true, get: function () { return function_calling_1.convertToOpenAIFunction; } });
Object.defineProperty(exports, "formatToOpenAITool", { enumerable: true, get: function () { return function_calling_1.convertToOpenAITool; } });
function formatToOpenAIAssistantTool(tool) {
    return {
        type: "function",
        function: {
            name: tool.name,
            description: tool.description,
            parameters: (0, zod_to_json_schema_1.zodToJsonSchema)(tool.schema),
        },
    };
}
exports.formatToOpenAIAssistantTool = formatToOpenAIAssistantTool;
