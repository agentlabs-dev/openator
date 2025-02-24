"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToChunk = exports.mapChatMessagesToStoredMessages = exports.mapStoredMessagesToChatMessages = exports.mapStoredMessageToChatMessage = exports.getBufferString = exports.coerceMessageLikeToMessage = void 0;
const index_js_1 = require("../errors/index.cjs");
const utils_js_1 = require("../tools/utils.cjs");
const ai_js_1 = require("./ai.cjs");
const base_js_1 = require("./base.cjs");
const chat_js_1 = require("./chat.cjs");
const function_js_1 = require("./function.cjs");
const human_js_1 = require("./human.cjs");
const system_js_1 = require("./system.cjs");
const tool_js_1 = require("./tool.cjs");
function _coerceToolCall(toolCall) {
    if ((0, utils_js_1._isToolCall)(toolCall)) {
        return toolCall;
    }
    else if (typeof toolCall.id === "string" &&
        toolCall.type === "function" &&
        typeof toolCall.function === "object" &&
        toolCall.function !== null &&
        "arguments" in toolCall.function &&
        typeof toolCall.function.arguments === "string" &&
        "name" in toolCall.function &&
        typeof toolCall.function.name === "string") {
        // Handle OpenAI tool call format
        return {
            id: toolCall.id,
            args: JSON.parse(toolCall.function.arguments),
            name: toolCall.function.name,
            type: "tool_call",
        };
    }
    else {
        // TODO: Throw an error?
        return toolCall;
    }
}
function isSerializedConstructor(x) {
    return (typeof x === "object" &&
        x != null &&
        x.lc === 1 &&
        Array.isArray(x.id) &&
        x.kwargs != null &&
        typeof x.kwargs === "object");
}
function _constructMessageFromParams(params) {
    let type;
    let rest;
    // Support serialized messages
    if (isSerializedConstructor(params)) {
        const className = params.id.at(-1);
        if (className === "HumanMessage" || className === "HumanMessageChunk") {
            type = "user";
        }
        else if (className === "AIMessage" || className === "AIMessageChunk") {
            type = "assistant";
        }
        else if (className === "SystemMessage" ||
            className === "SystemMessageChunk") {
            type = "system";
        }
        else if (className === "FunctionMessage" ||
            className === "FunctionMessageChunk") {
            type = "function";
        }
        else if (className === "ToolMessage" ||
            className === "ToolMessageChunk") {
            type = "tool";
        }
        else {
            type = "unknown";
        }
        rest = params.kwargs;
    }
    else {
        const { type: extractedType, ...otherParams } = params;
        type = extractedType;
        rest = otherParams;
    }
    if (type === "human" || type === "user") {
        return new human_js_1.HumanMessage(rest);
    }
    else if (type === "ai" || type === "assistant") {
        const { tool_calls: rawToolCalls, ...other } = rest;
        if (!Array.isArray(rawToolCalls)) {
            return new ai_js_1.AIMessage(rest);
        }
        const tool_calls = rawToolCalls.map(_coerceToolCall);
        return new ai_js_1.AIMessage({ ...other, tool_calls });
    }
    else if (type === "system") {
        return new system_js_1.SystemMessage(rest);
    }
    else if (type === "developer") {
        return new system_js_1.SystemMessage({
            ...rest,
            additional_kwargs: {
                ...rest.additional_kwargs,
                __openai_role__: "developer",
            },
        });
    }
    else if (type === "tool" && "tool_call_id" in rest) {
        return new tool_js_1.ToolMessage({
            ...rest,
            content: rest.content,
            tool_call_id: rest.tool_call_id,
            name: rest.name,
        });
    }
    else {
        const error = (0, index_js_1.addLangChainErrorFields)(new Error(`Unable to coerce message from array: only human, AI, system, developer, or tool message coercion is currently supported.\n\nReceived: ${JSON.stringify(params, null, 2)}`), "MESSAGE_COERCION_FAILURE");
        throw error;
    }
}
function coerceMessageLikeToMessage(messageLike) {
    if (typeof messageLike === "string") {
        return new human_js_1.HumanMessage(messageLike);
    }
    else if ((0, base_js_1.isBaseMessage)(messageLike)) {
        return messageLike;
    }
    if (Array.isArray(messageLike)) {
        const [type, content] = messageLike;
        return _constructMessageFromParams({ type, content });
    }
    else if ((0, base_js_1._isMessageFieldWithRole)(messageLike)) {
        const { role: type, ...rest } = messageLike;
        return _constructMessageFromParams({ ...rest, type });
    }
    else {
        return _constructMessageFromParams(messageLike);
    }
}
exports.coerceMessageLikeToMessage = coerceMessageLikeToMessage;
/**
 * This function is used by memory classes to get a string representation
 * of the chat message history, based on the message content and role.
 */
function getBufferString(messages, humanPrefix = "Human", aiPrefix = "AI") {
    const string_messages = [];
    for (const m of messages) {
        let role;
        if (m._getType() === "human") {
            role = humanPrefix;
        }
        else if (m._getType() === "ai") {
            role = aiPrefix;
        }
        else if (m._getType() === "system") {
            role = "System";
        }
        else if (m._getType() === "function") {
            role = "Function";
        }
        else if (m._getType() === "tool") {
            role = "Tool";
        }
        else if (m._getType() === "generic") {
            role = m.role;
        }
        else {
            throw new Error(`Got unsupported message type: ${m._getType()}`);
        }
        const nameStr = m.name ? `${m.name}, ` : "";
        const readableContent = typeof m.content === "string"
            ? m.content
            : JSON.stringify(m.content, null, 2);
        string_messages.push(`${role}: ${nameStr}${readableContent}`);
    }
    return string_messages.join("\n");
}
exports.getBufferString = getBufferString;
/**
 * Maps messages from an older format (V1) to the current `StoredMessage`
 * format. If the message is already in the `StoredMessage` format, it is
 * returned as is. Otherwise, it transforms the V1 message into a
 * `StoredMessage`. This function is important for maintaining
 * compatibility with older message formats.
 */
function mapV1MessageToStoredMessage(message) {
    // TODO: Remove this mapper when we deprecate the old message format.
    if (message.data !== undefined) {
        return message;
    }
    else {
        const v1Message = message;
        return {
            type: v1Message.type,
            data: {
                content: v1Message.text,
                role: v1Message.role,
                name: undefined,
                tool_call_id: undefined,
            },
        };
    }
}
function mapStoredMessageToChatMessage(message) {
    const storedMessage = mapV1MessageToStoredMessage(message);
    switch (storedMessage.type) {
        case "human":
            return new human_js_1.HumanMessage(storedMessage.data);
        case "ai":
            return new ai_js_1.AIMessage(storedMessage.data);
        case "system":
            return new system_js_1.SystemMessage(storedMessage.data);
        case "function":
            if (storedMessage.data.name === undefined) {
                throw new Error("Name must be defined for function messages");
            }
            return new function_js_1.FunctionMessage(storedMessage.data);
        case "tool":
            if (storedMessage.data.tool_call_id === undefined) {
                throw new Error("Tool call ID must be defined for tool messages");
            }
            return new tool_js_1.ToolMessage(storedMessage.data);
        case "generic": {
            if (storedMessage.data.role === undefined) {
                throw new Error("Role must be defined for chat messages");
            }
            return new chat_js_1.ChatMessage(storedMessage.data);
        }
        default:
            throw new Error(`Got unexpected type: ${storedMessage.type}`);
    }
}
exports.mapStoredMessageToChatMessage = mapStoredMessageToChatMessage;
/**
 * Transforms an array of `StoredMessage` instances into an array of
 * `BaseMessage` instances. It uses the `mapV1MessageToStoredMessage`
 * function to ensure all messages are in the `StoredMessage` format, then
 * creates new instances of the appropriate `BaseMessage` subclass based
 * on the type of each message. This function is used to prepare stored
 * messages for use in a chat context.
 */
function mapStoredMessagesToChatMessages(messages) {
    return messages.map(mapStoredMessageToChatMessage);
}
exports.mapStoredMessagesToChatMessages = mapStoredMessagesToChatMessages;
/**
 * Transforms an array of `BaseMessage` instances into an array of
 * `StoredMessage` instances. It does this by calling the `toDict` method
 * on each `BaseMessage`, which returns a `StoredMessage`. This function
 * is used to prepare chat messages for storage.
 */
function mapChatMessagesToStoredMessages(messages) {
    return messages.map((message) => message.toDict());
}
exports.mapChatMessagesToStoredMessages = mapChatMessagesToStoredMessages;
function convertToChunk(message) {
    const type = message._getType();
    if (type === "human") {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new human_js_1.HumanMessageChunk({ ...message });
    }
    else if (type === "ai") {
        let aiChunkFields = {
            ...message,
        };
        if ("tool_calls" in aiChunkFields) {
            aiChunkFields = {
                ...aiChunkFields,
                tool_call_chunks: aiChunkFields.tool_calls?.map((tc) => ({
                    ...tc,
                    type: "tool_call_chunk",
                    index: undefined,
                    args: JSON.stringify(tc.args),
                })),
            };
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new ai_js_1.AIMessageChunk({ ...aiChunkFields });
    }
    else if (type === "system") {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new system_js_1.SystemMessageChunk({ ...message });
    }
    else if (type === "function") {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new function_js_1.FunctionMessageChunk({ ...message });
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
    }
    else if (chat_js_1.ChatMessage.isInstance(message)) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return new chat_js_1.ChatMessageChunk({ ...message });
    }
    else {
        throw new Error("Unknown message type.");
    }
}
exports.convertToChunk = convertToChunk;
