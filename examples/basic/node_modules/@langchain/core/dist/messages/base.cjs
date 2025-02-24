"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBaseMessageChunk = exports.isBaseMessage = exports._isMessageFieldWithRole = exports.BaseMessageChunk = exports._mergeObj = exports._mergeLists = exports._mergeDicts = exports.isOpenAIToolCallArray = exports.BaseMessage = exports._mergeStatus = exports.mergeContent = void 0;
const serializable_js_1 = require("../load/serializable.cjs");
function mergeContent(firstContent, secondContent) {
    // If first content is a string
    if (typeof firstContent === "string") {
        if (typeof secondContent === "string") {
            return firstContent + secondContent;
        }
        else {
            return [{ type: "text", text: firstContent }, ...secondContent];
        }
        // If both are arrays
    }
    else if (Array.isArray(secondContent)) {
        return (_mergeLists(firstContent, secondContent) ?? [
            ...firstContent,
            ...secondContent,
        ]);
    }
    else {
        // Otherwise, add the second content as a new element of the list
        return [...firstContent, { type: "text", text: secondContent }];
    }
}
exports.mergeContent = mergeContent;
/**
 * 'Merge' two statuses. If either value passed is 'error', it will return 'error'. Else
 * it will return 'success'.
 *
 * @param {"success" | "error" | undefined} left The existing value to 'merge' with the new value.
 * @param {"success" | "error" | undefined} right The new value to 'merge' with the existing value
 * @returns {"success" | "error"} The 'merged' value.
 */
function _mergeStatus(left, right) {
    if (left === "error" || right === "error") {
        return "error";
    }
    return "success";
}
exports._mergeStatus = _mergeStatus;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stringifyWithDepthLimit(obj, depthLimit) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function helper(obj, currentDepth) {
        if (typeof obj !== "object" || obj === null || obj === undefined) {
            return obj;
        }
        if (currentDepth >= depthLimit) {
            if (Array.isArray(obj)) {
                return "[Array]";
            }
            return "[Object]";
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => helper(item, currentDepth + 1));
        }
        const result = {};
        for (const key of Object.keys(obj)) {
            result[key] = helper(obj[key], currentDepth + 1);
        }
        return result;
    }
    return JSON.stringify(helper(obj, 0), null, 2);
}
/**
 * Base class for all types of messages in a conversation. It includes
 * properties like `content`, `name`, and `additional_kwargs`. It also
 * includes methods like `toDict()` and `_getType()`.
 */
class BaseMessage extends serializable_js_1.Serializable {
    get lc_aliases() {
        // exclude snake case conversion to pascal case
        return {
            additional_kwargs: "additional_kwargs",
            response_metadata: "response_metadata",
        };
    }
    /**
     * @deprecated
     * Use {@link BaseMessage.content} instead.
     */
    get text() {
        return typeof this.content === "string" ? this.content : "";
    }
    /** The type of the message. */
    getType() {
        return this._getType();
    }
    constructor(fields, 
    /** @deprecated */
    kwargs) {
        if (typeof fields === "string") {
            // eslint-disable-next-line no-param-reassign
            fields = {
                content: fields,
                additional_kwargs: kwargs,
                response_metadata: {},
            };
        }
        // Make sure the default value for additional_kwargs is passed into super() for serialization
        if (!fields.additional_kwargs) {
            // eslint-disable-next-line no-param-reassign
            fields.additional_kwargs = {};
        }
        if (!fields.response_metadata) {
            // eslint-disable-next-line no-param-reassign
            fields.response_metadata = {};
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "messages"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        /** The content of the message. */
        Object.defineProperty(this, "content", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** The name of the message sender in a multi-user chat. */
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Additional keyword arguments */
        Object.defineProperty(this, "additional_kwargs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** Response metadata. For example: response headers, logprobs, token counts. */
        Object.defineProperty(this, "response_metadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * An optional unique identifier for the message. This should ideally be
         * provided by the provider/model which created the message.
         */
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = fields.name;
        this.content = fields.content;
        this.additional_kwargs = fields.additional_kwargs;
        this.response_metadata = fields.response_metadata;
        this.id = fields.id;
    }
    toDict() {
        return {
            type: this._getType(),
            data: this.toJSON()
                .kwargs,
        };
    }
    static lc_name() {
        return "BaseMessage";
    }
    // Can't be protected for silly reasons
    get _printableFields() {
        return {
            id: this.id,
            content: this.content,
            name: this.name,
            additional_kwargs: this.additional_kwargs,
            response_metadata: this.response_metadata,
        };
    }
    // this private method is used to update the ID for the runtime
    // value as well as in lc_kwargs for serialisation
    _updateId(value) {
        this.id = value;
        // lc_attributes wouldn't work here, because jest compares the
        // whole object
        this.lc_kwargs.id = value;
    }
    get [Symbol.toStringTag]() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.constructor.lc_name();
    }
    // Override the default behavior of console.log
    [Symbol.for("nodejs.util.inspect.custom")](depth) {
        if (depth === null) {
            return this;
        }
        const printable = stringifyWithDepthLimit(this._printableFields, Math.max(4, depth));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return `${this.constructor.lc_name()} ${printable}`;
    }
}
exports.BaseMessage = BaseMessage;
function isOpenAIToolCallArray(value) {
    return (Array.isArray(value) &&
        value.every((v) => typeof v.index === "number"));
}
exports.isOpenAIToolCallArray = isOpenAIToolCallArray;
function _mergeDicts(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
left, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
right
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
    const merged = { ...left };
    for (const [key, value] of Object.entries(right)) {
        if (merged[key] == null) {
            merged[key] = value;
        }
        else if (value == null) {
            continue;
        }
        else if (typeof merged[key] !== typeof value ||
            Array.isArray(merged[key]) !== Array.isArray(value)) {
            throw new Error(`field[${key}] already exists in the message chunk, but with a different type.`);
        }
        else if (typeof merged[key] === "string") {
            if (key === "type") {
                // Do not merge 'type' fields
                continue;
            }
            merged[key] += value;
        }
        else if (typeof merged[key] === "object" && !Array.isArray(merged[key])) {
            merged[key] = _mergeDicts(merged[key], value);
        }
        else if (Array.isArray(merged[key])) {
            merged[key] = _mergeLists(merged[key], value);
        }
        else if (merged[key] === value) {
            continue;
        }
        else {
            console.warn(`field[${key}] already exists in this message chunk and value has unsupported type.`);
        }
    }
    return merged;
}
exports._mergeDicts = _mergeDicts;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _mergeLists(left, right) {
    if (left === undefined && right === undefined) {
        return undefined;
    }
    else if (left === undefined || right === undefined) {
        return left || right;
    }
    else {
        const merged = [...left];
        for (const item of right) {
            if (typeof item === "object" &&
                "index" in item &&
                typeof item.index === "number") {
                const toMerge = merged.findIndex((leftItem) => leftItem.index === item.index);
                if (toMerge !== -1) {
                    merged[toMerge] = _mergeDicts(merged[toMerge], item);
                }
                else {
                    merged.push(item);
                }
            }
            else if (typeof item === "object" &&
                "text" in item &&
                item.text === "") {
                // No-op - skip empty text blocks
                continue;
            }
            else {
                merged.push(item);
            }
        }
        return merged;
    }
}
exports._mergeLists = _mergeLists;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _mergeObj(left, right) {
    if (!left && !right) {
        throw new Error("Cannot merge two undefined objects.");
    }
    if (!left || !right) {
        return left || right;
    }
    else if (typeof left !== typeof right) {
        throw new Error(`Cannot merge objects of different types.\nLeft ${typeof left}\nRight ${typeof right}`);
    }
    else if (typeof left === "string" && typeof right === "string") {
        return (left + right);
    }
    else if (Array.isArray(left) && Array.isArray(right)) {
        return _mergeLists(left, right);
    }
    else if (typeof left === "object" && typeof right === "object") {
        return _mergeDicts(left, right);
    }
    else if (left === right) {
        return left;
    }
    else {
        throw new Error(`Can not merge objects of different types.\nLeft ${left}\nRight ${right}`);
    }
}
exports._mergeObj = _mergeObj;
/**
 * Represents a chunk of a message, which can be concatenated with other
 * message chunks. It includes a method `_merge_kwargs_dict()` for merging
 * additional keyword arguments from another `BaseMessageChunk` into this
 * one. It also overrides the `__add__()` method to support concatenation
 * of `BaseMessageChunk` instances.
 */
class BaseMessageChunk extends BaseMessage {
}
exports.BaseMessageChunk = BaseMessageChunk;
function _isMessageFieldWithRole(x) {
    return typeof x.role === "string";
}
exports._isMessageFieldWithRole = _isMessageFieldWithRole;
function isBaseMessage(messageLike) {
    return typeof messageLike?._getType === "function";
}
exports.isBaseMessage = isBaseMessage;
function isBaseMessageChunk(messageLike) {
    return (isBaseMessage(messageLike) &&
        typeof messageLike.concat === "function");
}
exports.isBaseMessageChunk = isBaseMessageChunk;
