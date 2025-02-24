"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatToOpenAIToolChoice = exports.formatToOpenAIAssistantTool = exports.formatToOpenAITool = exports.formatToOpenAIFunction = exports.wrapOpenAIClientError = void 0;
const openai_1 = require("openai");
const zod_to_json_schema_1 = require("zod-to-json-schema");
const function_calling_1 = require("@langchain/core/utils/function_calling");
Object.defineProperty(exports, "formatToOpenAIFunction", { enumerable: true, get: function () { return function_calling_1.convertToOpenAIFunction; } });
Object.defineProperty(exports, "formatToOpenAITool", { enumerable: true, get: function () { return function_calling_1.convertToOpenAITool; } });
const errors_js_1 = require("./errors.cjs");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapOpenAIClientError(e) {
    let error;
    if (e.constructor.name === openai_1.APIConnectionTimeoutError.name) {
        error = new Error(e.message);
        error.name = "TimeoutError";
    }
    else if (e.constructor.name === openai_1.APIUserAbortError.name) {
        error = new Error(e.message);
        error.name = "AbortError";
    }
    else if (e.status === 400 && e.message.includes("tool_calls")) {
        error = (0, errors_js_1.addLangChainErrorFields)(e, "INVALID_TOOL_RESULTS");
    }
    else if (e.status === 401) {
        error = (0, errors_js_1.addLangChainErrorFields)(e, "MODEL_AUTHENTICATION");
    }
    else if (e.status === 429) {
        error = (0, errors_js_1.addLangChainErrorFields)(e, "MODEL_RATE_LIMIT");
    }
    else if (e.status === 404) {
        error = (0, errors_js_1.addLangChainErrorFields)(e, "MODEL_NOT_FOUND");
    }
    else {
        error = e;
    }
    return error;
}
exports.wrapOpenAIClientError = wrapOpenAIClientError;
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
function formatToOpenAIToolChoice(toolChoice) {
    if (!toolChoice) {
        return undefined;
    }
    else if (toolChoice === "any" || toolChoice === "required") {
        return "required";
    }
    else if (toolChoice === "auto") {
        return "auto";
    }
    else if (toolChoice === "none") {
        return "none";
    }
    else if (typeof toolChoice === "string") {
        return {
            type: "function",
            function: {
                name: toolChoice,
            },
        };
    }
    else {
        return toolChoice;
    }
}
exports.formatToOpenAIToolChoice = formatToOpenAIToolChoice;
