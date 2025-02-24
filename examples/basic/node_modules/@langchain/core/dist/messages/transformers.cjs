"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTextSplitter = exports.trimMessages = exports.mergeMessageRuns = exports.filterMessages = void 0;
const base_js_1 = require("../runnables/base.cjs");
const ai_js_1 = require("./ai.cjs");
const base_js_2 = require("./base.cjs");
const chat_js_1 = require("./chat.cjs");
const function_js_1 = require("./function.cjs");
const human_js_1 = require("./human.cjs");
const modifier_js_1 = require("./modifier.cjs");
const system_js_1 = require("./system.cjs");
const tool_js_1 = require("./tool.cjs");
const utils_js_1 = require("./utils.cjs");
const _isMessageType = (msg, types) => {
    const typesAsStrings = [
        ...new Set(types?.map((t) => {
            if (typeof t === "string") {
                return t;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const instantiatedMsgClass = new t({});
            if (!("getType" in instantiatedMsgClass) ||
                typeof instantiatedMsgClass.getType !== "function") {
                throw new Error("Invalid type provided.");
            }
            return instantiatedMsgClass.getType();
        })),
    ];
    const msgType = msg.getType();
    return typesAsStrings.some((t) => t === msgType);
};
function filterMessages(messagesOrOptions, options) {
    if (Array.isArray(messagesOrOptions)) {
        return _filterMessages(messagesOrOptions, options);
    }
    return base_js_1.RunnableLambda.from((input) => {
        return _filterMessages(input, messagesOrOptions);
    });
}
exports.filterMessages = filterMessages;
function _filterMessages(messages, options = {}) {
    const { includeNames, excludeNames, includeTypes, excludeTypes, includeIds, excludeIds, } = options;
    const filtered = [];
    for (const msg of messages) {
        if (excludeNames && msg.name && excludeNames.includes(msg.name)) {
            continue;
        }
        else if (excludeTypes && _isMessageType(msg, excludeTypes)) {
            continue;
        }
        else if (excludeIds && msg.id && excludeIds.includes(msg.id)) {
            continue;
        }
        // default to inclusion when no inclusion criteria given.
        if (!(includeTypes || includeIds || includeNames)) {
            filtered.push(msg);
        }
        else if (includeNames &&
            msg.name &&
            includeNames.some((iName) => iName === msg.name)) {
            filtered.push(msg);
        }
        else if (includeTypes && _isMessageType(msg, includeTypes)) {
            filtered.push(msg);
        }
        else if (includeIds && msg.id && includeIds.some((id) => id === msg.id)) {
            filtered.push(msg);
        }
    }
    return filtered;
}
function mergeMessageRuns(messages) {
    if (Array.isArray(messages)) {
        return _mergeMessageRuns(messages);
    }
    return base_js_1.RunnableLambda.from(_mergeMessageRuns);
}
exports.mergeMessageRuns = mergeMessageRuns;
function _mergeMessageRuns(messages) {
    if (!messages.length) {
        return [];
    }
    const merged = [];
    for (const msg of messages) {
        const curr = msg;
        const last = merged.pop();
        if (!last) {
            merged.push(curr);
        }
        else if (curr.getType() === "tool" ||
            !(curr.getType() === last.getType())) {
            merged.push(last, curr);
        }
        else {
            const lastChunk = (0, utils_js_1.convertToChunk)(last);
            const currChunk = (0, utils_js_1.convertToChunk)(curr);
            const mergedChunks = lastChunk.concat(currChunk);
            if (typeof lastChunk.content === "string" &&
                typeof currChunk.content === "string") {
                mergedChunks.content = `${lastChunk.content}\n${currChunk.content}`;
            }
            merged.push(_chunkToMsg(mergedChunks));
        }
    }
    return merged;
}
function trimMessages(messagesOrOptions, options) {
    if (Array.isArray(messagesOrOptions)) {
        const messages = messagesOrOptions;
        if (!options) {
            throw new Error("Options parameter is required when providing messages.");
        }
        return _trimMessagesHelper(messages, options);
    }
    else {
        const trimmerOptions = messagesOrOptions;
        return base_js_1.RunnableLambda.from((input) => _trimMessagesHelper(input, trimmerOptions)).withConfig({
            runName: "trim_messages",
        });
    }
}
exports.trimMessages = trimMessages;
async function _trimMessagesHelper(messages, options) {
    const { maxTokens, tokenCounter, strategy = "last", allowPartial = false, endOn, startOn, includeSystem = false, textSplitter, } = options;
    if (startOn && strategy === "first") {
        throw new Error("`startOn` should only be specified if `strategy` is 'last'.");
    }
    if (includeSystem && strategy === "first") {
        throw new Error("`includeSystem` should only be specified if `strategy` is 'last'.");
    }
    let listTokenCounter;
    if ("getNumTokens" in tokenCounter) {
        listTokenCounter = async (msgs) => {
            const tokenCounts = await Promise.all(msgs.map((msg) => tokenCounter.getNumTokens(msg.content)));
            return tokenCounts.reduce((sum, count) => sum + count, 0);
        };
    }
    else {
        listTokenCounter = async (msgs) => tokenCounter(msgs);
    }
    let textSplitterFunc = defaultTextSplitter;
    if (textSplitter) {
        if ("splitText" in textSplitter) {
            textSplitterFunc = textSplitter.splitText;
        }
        else {
            textSplitterFunc = async (text) => textSplitter(text);
        }
    }
    if (strategy === "first") {
        return _firstMaxTokens(messages, {
            maxTokens,
            tokenCounter: listTokenCounter,
            textSplitter: textSplitterFunc,
            partialStrategy: allowPartial ? "first" : undefined,
            endOn,
        });
    }
    else if (strategy === "last") {
        return _lastMaxTokens(messages, {
            maxTokens,
            tokenCounter: listTokenCounter,
            textSplitter: textSplitterFunc,
            allowPartial,
            includeSystem,
            startOn,
            endOn,
        });
    }
    else {
        throw new Error(`Unrecognized strategy: '${strategy}'. Must be one of 'first' or 'last'.`);
    }
}
async function _firstMaxTokens(messages, options) {
    const { maxTokens, tokenCounter, textSplitter, partialStrategy, endOn } = options;
    let messagesCopy = [...messages];
    let idx = 0;
    for (let i = 0; i < messagesCopy.length; i += 1) {
        const remainingMessages = i > 0 ? messagesCopy.slice(0, -i) : messagesCopy;
        if ((await tokenCounter(remainingMessages)) <= maxTokens) {
            idx = messagesCopy.length - i;
            break;
        }
    }
    if (idx < messagesCopy.length - 1 && partialStrategy) {
        let includedPartial = false;
        if (Array.isArray(messagesCopy[idx].content)) {
            const excluded = messagesCopy[idx];
            if (typeof excluded.content === "string") {
                throw new Error("Expected content to be an array.");
            }
            const numBlock = excluded.content.length;
            const reversedContent = partialStrategy === "last"
                ? [...excluded.content].reverse()
                : excluded.content;
            for (let i = 1; i <= numBlock; i += 1) {
                const partialContent = partialStrategy === "first"
                    ? reversedContent.slice(0, i)
                    : reversedContent.slice(-i);
                const fields = Object.fromEntries(Object.entries(excluded).filter(([k]) => k !== "type" && !k.startsWith("lc_")));
                const updatedMessage = _switchTypeToMessage(excluded.getType(), {
                    ...fields,
                    content: partialContent,
                });
                const slicedMessages = [...messagesCopy.slice(0, idx), updatedMessage];
                if ((await tokenCounter(slicedMessages)) <= maxTokens) {
                    messagesCopy = slicedMessages;
                    idx += 1;
                    includedPartial = true;
                }
                else {
                    break;
                }
            }
            if (includedPartial && partialStrategy === "last") {
                excluded.content = [...reversedContent].reverse();
            }
        }
        if (!includedPartial) {
            const excluded = messagesCopy[idx];
            let text;
            if (Array.isArray(excluded.content) &&
                excluded.content.some((block) => typeof block === "string" || block.type === "text")) {
                const textBlock = excluded.content.find((block) => block.type === "text" && block.text);
                text = textBlock?.text;
            }
            else if (typeof excluded.content === "string") {
                text = excluded.content;
            }
            if (text) {
                const splitTexts = await textSplitter(text);
                const numSplits = splitTexts.length;
                if (partialStrategy === "last") {
                    splitTexts.reverse();
                }
                for (let _ = 0; _ < numSplits - 1; _ += 1) {
                    splitTexts.pop();
                    excluded.content = splitTexts.join("");
                    if ((await tokenCounter([...messagesCopy.slice(0, idx), excluded])) <=
                        maxTokens) {
                        if (partialStrategy === "last") {
                            excluded.content = [...splitTexts].reverse().join("");
                        }
                        messagesCopy = [...messagesCopy.slice(0, idx), excluded];
                        idx += 1;
                        break;
                    }
                }
            }
        }
    }
    if (endOn) {
        const endOnArr = Array.isArray(endOn) ? endOn : [endOn];
        while (idx > 0 && !_isMessageType(messagesCopy[idx - 1], endOnArr)) {
            idx -= 1;
        }
    }
    return messagesCopy.slice(0, idx);
}
async function _lastMaxTokens(messages, options) {
    const { allowPartial = false, includeSystem = false, endOn, startOn, ...rest } = options;
    // Create a copy of messages to avoid mutation
    let messagesCopy = messages.map((message) => {
        const fields = Object.fromEntries(Object.entries(message).filter(([k]) => k !== "type" && !k.startsWith("lc_")));
        return _switchTypeToMessage(message.getType(), fields, (0, base_js_2.isBaseMessageChunk)(message));
    });
    if (endOn) {
        const endOnArr = Array.isArray(endOn) ? endOn : [endOn];
        while (messagesCopy.length > 0 &&
            !_isMessageType(messagesCopy[messagesCopy.length - 1], endOnArr)) {
            messagesCopy = messagesCopy.slice(0, -1);
        }
    }
    const swappedSystem = includeSystem && messagesCopy[0]?.getType() === "system";
    let reversed_ = swappedSystem
        ? messagesCopy.slice(0, 1).concat(messagesCopy.slice(1).reverse())
        : messagesCopy.reverse();
    reversed_ = await _firstMaxTokens(reversed_, {
        ...rest,
        partialStrategy: allowPartial ? "last" : undefined,
        endOn: startOn,
    });
    if (swappedSystem) {
        return [reversed_[0], ...reversed_.slice(1).reverse()];
    }
    else {
        return reversed_.reverse();
    }
}
const _MSG_CHUNK_MAP = {
    human: {
        message: human_js_1.HumanMessage,
        messageChunk: human_js_1.HumanMessageChunk,
    },
    ai: {
        message: ai_js_1.AIMessage,
        messageChunk: ai_js_1.AIMessageChunk,
    },
    system: {
        message: system_js_1.SystemMessage,
        messageChunk: system_js_1.SystemMessageChunk,
    },
    developer: {
        message: system_js_1.SystemMessage,
        messageChunk: system_js_1.SystemMessageChunk,
    },
    tool: {
        message: tool_js_1.ToolMessage,
        messageChunk: tool_js_1.ToolMessageChunk,
    },
    function: {
        message: function_js_1.FunctionMessage,
        messageChunk: function_js_1.FunctionMessageChunk,
    },
    generic: {
        message: chat_js_1.ChatMessage,
        messageChunk: chat_js_1.ChatMessageChunk,
    },
    remove: {
        message: modifier_js_1.RemoveMessage,
        messageChunk: modifier_js_1.RemoveMessage, // RemoveMessage does not have a chunk class.
    },
};
function _switchTypeToMessage(messageType, fields, returnChunk) {
    let chunk;
    let msg;
    switch (messageType) {
        case "human":
            if (returnChunk) {
                chunk = new human_js_1.HumanMessageChunk(fields);
            }
            else {
                msg = new human_js_1.HumanMessage(fields);
            }
            break;
        case "ai":
            if (returnChunk) {
                let aiChunkFields = {
                    ...fields,
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
                chunk = new ai_js_1.AIMessageChunk(aiChunkFields);
            }
            else {
                msg = new ai_js_1.AIMessage(fields);
            }
            break;
        case "system":
            if (returnChunk) {
                chunk = new system_js_1.SystemMessageChunk(fields);
            }
            else {
                msg = new system_js_1.SystemMessage(fields);
            }
            break;
        case "developer":
            if (returnChunk) {
                chunk = new system_js_1.SystemMessageChunk({
                    ...fields,
                    additional_kwargs: {
                        ...fields.additional_kwargs,
                        __openai_role__: "developer",
                    },
                });
            }
            else {
                msg = new system_js_1.SystemMessage({
                    ...fields,
                    additional_kwargs: {
                        ...fields.additional_kwargs,
                        __openai_role__: "developer",
                    },
                });
            }
            break;
        case "tool":
            if ("tool_call_id" in fields) {
                if (returnChunk) {
                    chunk = new tool_js_1.ToolMessageChunk(fields);
                }
                else {
                    msg = new tool_js_1.ToolMessage(fields);
                }
            }
            else {
                throw new Error("Can not convert ToolMessage to ToolMessageChunk if 'tool_call_id' field is not defined.");
            }
            break;
        case "function":
            if (returnChunk) {
                chunk = new function_js_1.FunctionMessageChunk(fields);
            }
            else {
                if (!fields.name) {
                    throw new Error("FunctionMessage must have a 'name' field");
                }
                msg = new function_js_1.FunctionMessage(fields);
            }
            break;
        case "generic":
            if ("role" in fields) {
                if (returnChunk) {
                    chunk = new chat_js_1.ChatMessageChunk(fields);
                }
                else {
                    msg = new chat_js_1.ChatMessage(fields);
                }
            }
            else {
                throw new Error("Can not convert ChatMessage to ChatMessageChunk if 'role' field is not defined.");
            }
            break;
        default:
            throw new Error(`Unrecognized message type ${messageType}`);
    }
    if (returnChunk && chunk) {
        return chunk;
    }
    if (msg) {
        return msg;
    }
    throw new Error(`Unrecognized message type ${messageType}`);
}
function _chunkToMsg(chunk) {
    const chunkType = chunk.getType();
    let msg;
    const fields = Object.fromEntries(Object.entries(chunk).filter(([k]) => !["type", "tool_call_chunks"].includes(k) && !k.startsWith("lc_")));
    if (chunkType in _MSG_CHUNK_MAP) {
        msg = _switchTypeToMessage(chunkType, fields);
    }
    if (!msg) {
        throw new Error(`Unrecognized message chunk class ${chunkType}. Supported classes are ${Object.keys(_MSG_CHUNK_MAP)}`);
    }
    return msg;
}
/**
 * The default text splitter function that splits text by newlines.
 *
 * @param {string} text
 * @returns A promise that resolves to an array of strings split by newlines.
 */
function defaultTextSplitter(text) {
    const splits = text.split("\n");
    return Promise.resolve([
        ...splits.slice(0, -1).map((s) => `${s}\n`),
        splits[splits.length - 1],
    ]);
}
exports.defaultTextSplitter = defaultTextSplitter;
