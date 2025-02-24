"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagePromptValue = exports.ChatPromptValue = exports.StringPromptValue = exports.BasePromptValue = void 0;
const serializable_js_1 = require("./load/serializable.cjs");
const human_js_1 = require("./messages/human.cjs");
const utils_js_1 = require("./messages/utils.cjs");
/**
 * Base PromptValue class. All prompt values should extend this class.
 */
class BasePromptValue extends serializable_js_1.Serializable {
}
exports.BasePromptValue = BasePromptValue;
/**
 * Represents a prompt value as a string. It extends the BasePromptValue
 * class and overrides the toString and toChatMessages methods.
 */
class StringPromptValue extends BasePromptValue {
    static lc_name() {
        return "StringPromptValue";
    }
    constructor(value) {
        super({ value });
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "prompt_values"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.value = value;
    }
    toString() {
        return this.value;
    }
    toChatMessages() {
        return [new human_js_1.HumanMessage(this.value)];
    }
}
exports.StringPromptValue = StringPromptValue;
/**
 * Class that represents a chat prompt value. It extends the
 * BasePromptValue and includes an array of BaseMessage instances.
 */
class ChatPromptValue extends BasePromptValue {
    static lc_name() {
        return "ChatPromptValue";
    }
    constructor(fields) {
        if (Array.isArray(fields)) {
            // eslint-disable-next-line no-param-reassign
            fields = { messages: fields };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "prompt_values"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "messages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.messages = fields.messages;
    }
    toString() {
        return (0, utils_js_1.getBufferString)(this.messages);
    }
    toChatMessages() {
        return this.messages;
    }
}
exports.ChatPromptValue = ChatPromptValue;
/**
 * Class that represents an image prompt value. It extends the
 * BasePromptValue and includes an ImageURL instance.
 */
class ImagePromptValue extends BasePromptValue {
    static lc_name() {
        return "ImagePromptValue";
    }
    constructor(fields) {
        if (!("imageUrl" in fields)) {
            // eslint-disable-next-line no-param-reassign
            fields = { imageUrl: fields };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "prompt_values"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "imageUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** @ignore */
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.imageUrl = fields.imageUrl;
    }
    toString() {
        return this.imageUrl.url;
    }
    toChatMessages() {
        return [
            new human_js_1.HumanMessage({
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            detail: this.imageUrl.detail,
                            url: this.imageUrl.url,
                        },
                    },
                ],
            }),
        ];
    }
}
exports.ImagePromptValue = ImagePromptValue;
