import { Serializable } from "./load/serializable.js";
import { HumanMessage } from "./messages/human.js";
import { getBufferString } from "./messages/utils.js";
/**
 * Base PromptValue class. All prompt values should extend this class.
 */
export class BasePromptValue extends Serializable {
}
/**
 * Represents a prompt value as a string. It extends the BasePromptValue
 * class and overrides the toString and toChatMessages methods.
 */
export class StringPromptValue extends BasePromptValue {
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
        return [new HumanMessage(this.value)];
    }
}
/**
 * Class that represents a chat prompt value. It extends the
 * BasePromptValue and includes an array of BaseMessage instances.
 */
export class ChatPromptValue extends BasePromptValue {
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
        return getBufferString(this.messages);
    }
    toChatMessages() {
        return this.messages;
    }
}
/**
 * Class that represents an image prompt value. It extends the
 * BasePromptValue and includes an ImageURL instance.
 */
export class ImagePromptValue extends BasePromptValue {
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
            new HumanMessage({
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
