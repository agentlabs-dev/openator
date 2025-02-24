"use strict";
// Default generic "any" values are for backwards compatibility.
// Replace with "string" when we are comfortable with a breaking change.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatPromptTemplate = exports.SystemMessagePromptTemplate = exports.AIMessagePromptTemplate = exports.HumanMessagePromptTemplate = exports.ChatMessagePromptTemplate = exports.BaseChatPromptTemplate = exports.BaseMessageStringPromptTemplate = exports.MessagesPlaceholder = exports.BaseMessagePromptTemplate = void 0;
const index_js_1 = require("../messages/index.cjs");
const prompt_values_js_1 = require("../prompt_values.cjs");
const base_js_1 = require("../runnables/base.cjs");
const string_js_1 = require("./string.cjs");
const base_js_2 = require("./base.cjs");
const prompt_js_1 = require("./prompt.cjs");
const image_js_1 = require("./image.cjs");
const template_js_1 = require("./template.cjs");
const index_js_2 = require("../errors/index.cjs");
/**
 * Abstract class that serves as a base for creating message prompt
 * templates. It defines how to format messages for different roles in a
 * conversation.
 */
class BaseMessagePromptTemplate extends base_js_1.Runnable {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "prompts", "chat"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
    /**
     * Calls the formatMessages method with the provided input and options.
     * @param input Input for the formatMessages method
     * @param options Optional BaseCallbackConfig
     * @returns Formatted output messages
     */
    async invoke(input, options) {
        return this._callWithConfig((input) => this.formatMessages(input), input, { ...options, runType: "prompt" });
    }
}
exports.BaseMessagePromptTemplate = BaseMessagePromptTemplate;
/**
 * Class that represents a placeholder for messages in a chat prompt. It
 * extends the BaseMessagePromptTemplate.
 */
class MessagesPlaceholder extends BaseMessagePromptTemplate {
    static lc_name() {
        return "MessagesPlaceholder";
    }
    constructor(fields) {
        if (typeof fields === "string") {
            // eslint-disable-next-line no-param-reassign
            fields = { variableName: fields };
        }
        super(fields);
        Object.defineProperty(this, "variableName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "optional", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.variableName = fields.variableName;
        this.optional = fields.optional ?? false;
    }
    get inputVariables() {
        return [this.variableName];
    }
    async formatMessages(values) {
        const input = values[this.variableName];
        if (this.optional && !input) {
            return [];
        }
        else if (!input) {
            const error = new Error(`Field "${this.variableName}" in prompt uses a MessagesPlaceholder, which expects an array of BaseMessages as an input value. Received: undefined`);
            error.name = "InputFormatError";
            throw error;
        }
        let formattedMessages;
        try {
            if (Array.isArray(input)) {
                formattedMessages = input.map(index_js_1.coerceMessageLikeToMessage);
            }
            else {
                formattedMessages = [(0, index_js_1.coerceMessageLikeToMessage)(input)];
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (e) {
            const readableInput = typeof input === "string" ? input : JSON.stringify(input, null, 2);
            const error = new Error([
                `Field "${this.variableName}" in prompt uses a MessagesPlaceholder, which expects an array of BaseMessages or coerceable values as input.`,
                `Received value: ${readableInput}`,
                `Additional message: ${e.message}`,
            ].join("\n\n"));
            error.name = "InputFormatError";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            error.lc_error_code = e.lc_error_code;
            throw error;
        }
        return formattedMessages;
    }
}
exports.MessagesPlaceholder = MessagesPlaceholder;
/**
 * Abstract class that serves as a base for creating message string prompt
 * templates. It extends the BaseMessagePromptTemplate.
 */
class BaseMessageStringPromptTemplate extends BaseMessagePromptTemplate {
    constructor(fields) {
        if (!("prompt" in fields)) {
            // eslint-disable-next-line no-param-reassign
            fields = { prompt: fields };
        }
        super(fields);
        Object.defineProperty(this, "prompt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.prompt = fields.prompt;
    }
    get inputVariables() {
        return this.prompt.inputVariables;
    }
    async formatMessages(values) {
        return [await this.format(values)];
    }
}
exports.BaseMessageStringPromptTemplate = BaseMessageStringPromptTemplate;
/**
 * Abstract class that serves as a base for creating chat prompt
 * templates. It extends the BasePromptTemplate.
 */
class BaseChatPromptTemplate extends base_js_2.BasePromptTemplate {
    constructor(input) {
        super(input);
    }
    async format(values) {
        return (await this.formatPromptValue(values)).toString();
    }
    async formatPromptValue(values) {
        const resultMessages = await this.formatMessages(values);
        return new prompt_values_js_1.ChatPromptValue(resultMessages);
    }
}
exports.BaseChatPromptTemplate = BaseChatPromptTemplate;
/**
 * Class that represents a chat message prompt template. It extends the
 * BaseMessageStringPromptTemplate.
 */
class ChatMessagePromptTemplate extends BaseMessageStringPromptTemplate {
    static lc_name() {
        return "ChatMessagePromptTemplate";
    }
    constructor(fields, role) {
        if (!("prompt" in fields)) {
            // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-non-null-assertion
            fields = { prompt: fields, role: role };
        }
        super(fields);
        Object.defineProperty(this, "role", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.role = fields.role;
    }
    async format(values) {
        return new index_js_1.ChatMessage(await this.prompt.format(values), this.role);
    }
    static fromTemplate(template, role, options) {
        return new this(prompt_js_1.PromptTemplate.fromTemplate(template, {
            templateFormat: options?.templateFormat,
        }), role);
    }
}
exports.ChatMessagePromptTemplate = ChatMessagePromptTemplate;
class _StringImageMessagePromptTemplate extends BaseMessagePromptTemplate {
    static _messageClass() {
        throw new Error("Can not invoke _messageClass from inside _StringImageMessagePromptTemplate");
    }
    constructor(
    /** @TODO When we come up with a better way to type prompt templates, fix this */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields, additionalOptions) {
        if (!("prompt" in fields)) {
            // eslint-disable-next-line no-param-reassign
            fields = { prompt: fields };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "prompts", "chat"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "inputVariables", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "additionalOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "prompt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "messageClass", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // ChatMessage contains role field, others don't.
        // Because of this, we have a separate class property for ChatMessage.
        Object.defineProperty(this, "chatMessageClass", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.prompt = fields.prompt;
        if (Array.isArray(this.prompt)) {
            let inputVariables = [];
            this.prompt.forEach((prompt) => {
                if ("inputVariables" in prompt) {
                    inputVariables = inputVariables.concat(prompt.inputVariables);
                }
            });
            this.inputVariables = inputVariables;
        }
        else {
            this.inputVariables = this.prompt.inputVariables;
        }
        this.additionalOptions = additionalOptions ?? this.additionalOptions;
    }
    createMessage(content) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const constructor = this.constructor;
        if (constructor._messageClass()) {
            const MsgClass = constructor._messageClass();
            return new MsgClass({ content });
        }
        else if (constructor.chatMessageClass) {
            const MsgClass = constructor.chatMessageClass();
            // Assuming ChatMessage constructor also takes a content argument
            return new MsgClass({
                content,
                role: this.getRoleFromMessageClass(MsgClass.lc_name()),
            });
        }
        else {
            throw new Error("No message class defined");
        }
    }
    getRoleFromMessageClass(name) {
        switch (name) {
            case "HumanMessage":
                return "human";
            case "AIMessage":
                return "ai";
            case "SystemMessage":
                return "system";
            case "ChatMessage":
                return "chat";
            default:
                throw new Error("Invalid message class name");
        }
    }
    static fromTemplate(template, additionalOptions) {
        if (typeof template === "string") {
            return new this(prompt_js_1.PromptTemplate.fromTemplate(template, additionalOptions));
        }
        const prompt = [];
        for (const item of template) {
            if (typeof item === "string" ||
                (typeof item === "object" && "text" in item)) {
                let text = "";
                if (typeof item === "string") {
                    text = item;
                }
                else if (typeof item.text === "string") {
                    text = item.text ?? "";
                }
                const options = {
                    ...additionalOptions,
                    ...(typeof item !== "string"
                        ? { additionalContentFields: item }
                        : {}),
                };
                prompt.push(prompt_js_1.PromptTemplate.fromTemplate(text, options));
            }
            else if (typeof item === "object" && "image_url" in item) {
                let imgTemplate = item.image_url ?? "";
                let imgTemplateObject;
                let inputVariables = [];
                if (typeof imgTemplate === "string") {
                    let parsedTemplate;
                    if (additionalOptions?.templateFormat === "mustache") {
                        parsedTemplate = (0, template_js_1.parseMustache)(imgTemplate);
                    }
                    else {
                        parsedTemplate = (0, template_js_1.parseFString)(imgTemplate);
                    }
                    const variables = parsedTemplate.flatMap((item) => item.type === "variable" ? [item.name] : []);
                    if ((variables?.length ?? 0) > 0) {
                        if (variables.length > 1) {
                            throw new Error(`Only one format variable allowed per image template.\nGot: ${variables}\nFrom: ${imgTemplate}`);
                        }
                        inputVariables = [variables[0]];
                    }
                    else {
                        inputVariables = [];
                    }
                    imgTemplate = { url: imgTemplate };
                    imgTemplateObject = new image_js_1.ImagePromptTemplate({
                        template: imgTemplate,
                        inputVariables,
                        templateFormat: additionalOptions?.templateFormat,
                        additionalContentFields: item,
                    });
                }
                else if (typeof imgTemplate === "object") {
                    if ("url" in imgTemplate) {
                        let parsedTemplate;
                        if (additionalOptions?.templateFormat === "mustache") {
                            parsedTemplate = (0, template_js_1.parseMustache)(imgTemplate.url);
                        }
                        else {
                            parsedTemplate = (0, template_js_1.parseFString)(imgTemplate.url);
                        }
                        inputVariables = parsedTemplate.flatMap((item) => item.type === "variable" ? [item.name] : []);
                    }
                    else {
                        inputVariables = [];
                    }
                    imgTemplateObject = new image_js_1.ImagePromptTemplate({
                        template: imgTemplate,
                        inputVariables,
                        templateFormat: additionalOptions?.templateFormat,
                        additionalContentFields: item,
                    });
                }
                else {
                    throw new Error("Invalid image template");
                }
                prompt.push(imgTemplateObject);
            }
        }
        return new this({ prompt, additionalOptions });
    }
    async format(input) {
        // eslint-disable-next-line no-instanceof/no-instanceof
        if (this.prompt instanceof string_js_1.BaseStringPromptTemplate) {
            const text = await this.prompt.format(input);
            return this.createMessage(text);
        }
        else {
            const content = [];
            for (const prompt of this.prompt) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let inputs = {};
                if (!("inputVariables" in prompt)) {
                    throw new Error(`Prompt ${prompt} does not have inputVariables defined.`);
                }
                for (const item of prompt.inputVariables) {
                    if (!inputs) {
                        inputs = { [item]: input[item] };
                    }
                    inputs = { ...inputs, [item]: input[item] };
                }
                // eslint-disable-next-line no-instanceof/no-instanceof
                if (prompt instanceof string_js_1.BaseStringPromptTemplate) {
                    const formatted = await prompt.format(inputs);
                    let additionalContentFields;
                    if ("additionalContentFields" in prompt) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        additionalContentFields = prompt.additionalContentFields;
                    }
                    content.push({
                        ...additionalContentFields,
                        type: "text",
                        text: formatted,
                    });
                    /** @TODO replace this */
                    // eslint-disable-next-line no-instanceof/no-instanceof
                }
                else if (prompt instanceof image_js_1.ImagePromptTemplate) {
                    const formatted = await prompt.format(inputs);
                    let additionalContentFields;
                    if ("additionalContentFields" in prompt) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        additionalContentFields = prompt.additionalContentFields;
                    }
                    content.push({
                        ...additionalContentFields,
                        type: "image_url",
                        image_url: formatted,
                    });
                }
            }
            return this.createMessage(content);
        }
    }
    async formatMessages(values) {
        return [await this.format(values)];
    }
}
/**
 * Class that represents a human message prompt template. It extends the
 * BaseMessageStringPromptTemplate.
 * @example
 * ```typescript
 * const message = HumanMessagePromptTemplate.fromTemplate("{text}");
 * const formatted = await message.format({ text: "Hello world!" });
 *
 * const chatPrompt = ChatPromptTemplate.fromMessages([message]);
 * const formattedChatPrompt = await chatPrompt.invoke({
 *   text: "Hello world!",
 * });
 * ```
 */
class HumanMessagePromptTemplate extends _StringImageMessagePromptTemplate {
    static _messageClass() {
        return index_js_1.HumanMessage;
    }
    static lc_name() {
        return "HumanMessagePromptTemplate";
    }
}
exports.HumanMessagePromptTemplate = HumanMessagePromptTemplate;
/**
 * Class that represents an AI message prompt template. It extends the
 * BaseMessageStringPromptTemplate.
 */
class AIMessagePromptTemplate extends _StringImageMessagePromptTemplate {
    static _messageClass() {
        return index_js_1.AIMessage;
    }
    static lc_name() {
        return "AIMessagePromptTemplate";
    }
}
exports.AIMessagePromptTemplate = AIMessagePromptTemplate;
/**
 * Class that represents a system message prompt template. It extends the
 * BaseMessageStringPromptTemplate.
 * @example
 * ```typescript
 * const message = SystemMessagePromptTemplate.fromTemplate("{text}");
 * const formatted = await message.format({ text: "Hello world!" });
 *
 * const chatPrompt = ChatPromptTemplate.fromMessages([message]);
 * const formattedChatPrompt = await chatPrompt.invoke({
 *   text: "Hello world!",
 * });
 * ```
 */
class SystemMessagePromptTemplate extends _StringImageMessagePromptTemplate {
    static _messageClass() {
        return index_js_1.SystemMessage;
    }
    static lc_name() {
        return "SystemMessagePromptTemplate";
    }
}
exports.SystemMessagePromptTemplate = SystemMessagePromptTemplate;
function _isBaseMessagePromptTemplate(baseMessagePromptTemplateLike) {
    return (typeof baseMessagePromptTemplateLike
        .formatMessages === "function");
}
function _coerceMessagePromptTemplateLike(messagePromptTemplateLike, extra) {
    if (_isBaseMessagePromptTemplate(messagePromptTemplateLike) ||
        (0, index_js_1.isBaseMessage)(messagePromptTemplateLike)) {
        return messagePromptTemplateLike;
    }
    if (Array.isArray(messagePromptTemplateLike) &&
        messagePromptTemplateLike[0] === "placeholder") {
        const messageContent = messagePromptTemplateLike[1];
        if (extra?.templateFormat === "mustache" &&
            typeof messageContent === "string" &&
            messageContent.slice(0, 2) === "{{" &&
            messageContent.slice(-2) === "}}") {
            const variableName = messageContent.slice(2, -2);
            return new MessagesPlaceholder({ variableName, optional: true });
        }
        else if (typeof messageContent === "string" &&
            messageContent[0] === "{" &&
            messageContent[messageContent.length - 1] === "}") {
            const variableName = messageContent.slice(1, -1);
            return new MessagesPlaceholder({ variableName, optional: true });
        }
        throw new Error(`Invalid placeholder template for format ${extra?.templateFormat ?? `"f-string"`}: "${messagePromptTemplateLike[1]}". Expected a variable name surrounded by ${extra?.templateFormat === "mustache" ? "double" : "single"} curly braces.`);
    }
    const message = (0, index_js_1.coerceMessageLikeToMessage)(messagePromptTemplateLike);
    let templateData;
    if (typeof message.content === "string") {
        templateData = message.content;
    }
    else {
        // Assuming message.content is an array of complex objects, transform it.
        templateData = message.content.map((item) => {
            if ("text" in item) {
                return { ...item, text: item.text };
            }
            else if ("image_url" in item) {
                return { ...item, image_url: item.image_url };
            }
            else {
                return item;
            }
        });
    }
    if (message._getType() === "human") {
        return HumanMessagePromptTemplate.fromTemplate(templateData, extra);
    }
    else if (message._getType() === "ai") {
        return AIMessagePromptTemplate.fromTemplate(templateData, extra);
    }
    else if (message._getType() === "system") {
        return SystemMessagePromptTemplate.fromTemplate(templateData, extra);
    }
    else if (index_js_1.ChatMessage.isInstance(message)) {
        return ChatMessagePromptTemplate.fromTemplate(message.content, message.role, extra);
    }
    else {
        throw new Error(`Could not coerce message prompt template from input. Received message type: "${message._getType()}".`);
    }
}
function isMessagesPlaceholder(x) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return x.constructor.lc_name() === "MessagesPlaceholder";
}
/**
 * Class that represents a chat prompt. It extends the
 * BaseChatPromptTemplate and uses an array of BaseMessagePromptTemplate
 * instances to format a series of messages for a conversation.
 * @example
 * ```typescript
 * const message = SystemMessagePromptTemplate.fromTemplate("{text}");
 * const chatPrompt = ChatPromptTemplate.fromMessages([
 *   ["ai", "You are a helpful assistant."],
 *   message,
 * ]);
 * const formattedChatPrompt = await chatPrompt.invoke({
 *   text: "Hello world!",
 * });
 * ```
 */
class ChatPromptTemplate extends BaseChatPromptTemplate {
    static lc_name() {
        return "ChatPromptTemplate";
    }
    get lc_aliases() {
        return {
            promptMessages: "messages",
        };
    }
    constructor(input) {
        super(input);
        Object.defineProperty(this, "promptMessages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "validateTemplate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "templateFormat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "f-string"
        });
        // If input is mustache and validateTemplate is not defined, set it to false
        if (input.templateFormat === "mustache" &&
            input.validateTemplate === undefined) {
            this.validateTemplate = false;
        }
        Object.assign(this, input);
        if (this.validateTemplate) {
            const inputVariablesMessages = new Set();
            for (const promptMessage of this.promptMessages) {
                // eslint-disable-next-line no-instanceof/no-instanceof
                if (promptMessage instanceof index_js_1.BaseMessage)
                    continue;
                for (const inputVariable of promptMessage.inputVariables) {
                    inputVariablesMessages.add(inputVariable);
                }
            }
            const totalInputVariables = this.inputVariables;
            const inputVariablesInstance = new Set(this.partialVariables
                ? totalInputVariables.concat(Object.keys(this.partialVariables))
                : totalInputVariables);
            const difference = new Set([...inputVariablesInstance].filter((x) => !inputVariablesMessages.has(x)));
            if (difference.size > 0) {
                throw new Error(`Input variables \`${[
                    ...difference,
                ]}\` are not used in any of the prompt messages.`);
            }
            const otherDifference = new Set([...inputVariablesMessages].filter((x) => !inputVariablesInstance.has(x)));
            if (otherDifference.size > 0) {
                throw new Error(`Input variables \`${[
                    ...otherDifference,
                ]}\` are used in prompt messages but not in the prompt template.`);
            }
        }
    }
    _getPromptType() {
        return "chat";
    }
    async _parseImagePrompts(message, inputValues) {
        if (typeof message.content === "string") {
            return message;
        }
        const formattedMessageContent = await Promise.all(message.content.map(async (item) => {
            if (item.type !== "image_url") {
                return item;
            }
            let imageUrl = "";
            if (typeof item.image_url === "string") {
                imageUrl = item.image_url;
            }
            else {
                imageUrl = item.image_url.url;
            }
            const promptTemplatePlaceholder = prompt_js_1.PromptTemplate.fromTemplate(imageUrl, {
                templateFormat: this.templateFormat,
            });
            const formattedUrl = await promptTemplatePlaceholder.format(inputValues);
            if (typeof item.image_url !== "string" && "url" in item.image_url) {
                // eslint-disable-next-line no-param-reassign
                item.image_url.url = formattedUrl;
            }
            else {
                // eslint-disable-next-line no-param-reassign
                item.image_url = formattedUrl;
            }
            return item;
        }));
        // eslint-disable-next-line no-param-reassign
        message.content = formattedMessageContent;
        return message;
    }
    async formatMessages(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        let resultMessages = [];
        for (const promptMessage of this.promptMessages) {
            // eslint-disable-next-line no-instanceof/no-instanceof
            if (promptMessage instanceof index_js_1.BaseMessage) {
                resultMessages.push(await this._parseImagePrompts(promptMessage, allValues));
            }
            else {
                const inputValues = promptMessage.inputVariables.reduce((acc, inputVariable) => {
                    if (!(inputVariable in allValues) &&
                        !(isMessagesPlaceholder(promptMessage) && promptMessage.optional)) {
                        const error = (0, index_js_2.addLangChainErrorFields)(new Error(`Missing value for input variable \`${inputVariable.toString()}\``), "INVALID_PROMPT_INPUT");
                        throw error;
                    }
                    acc[inputVariable] = allValues[inputVariable];
                    return acc;
                }, {});
                const message = await promptMessage.formatMessages(inputValues);
                resultMessages = resultMessages.concat(message);
            }
        }
        return resultMessages;
    }
    async partial(values) {
        // This is implemented in a way it doesn't require making
        // BaseMessagePromptTemplate aware of .partial()
        const newInputVariables = this.inputVariables.filter((iv) => !(iv in values));
        const newPartialVariables = {
            ...(this.partialVariables ?? {}),
            ...values,
        };
        const promptDict = {
            ...this,
            inputVariables: newInputVariables,
            partialVariables: newPartialVariables,
        };
        return new ChatPromptTemplate(promptDict);
    }
    static fromTemplate(template, options) {
        const prompt = prompt_js_1.PromptTemplate.fromTemplate(template, options);
        const humanTemplate = new HumanMessagePromptTemplate({ prompt });
        return this.fromMessages([humanTemplate]);
    }
    /**
     * Create a chat model-specific prompt from individual chat messages
     * or message-like tuples.
     * @param promptMessages Messages to be passed to the chat model
     * @returns A new ChatPromptTemplate
     */
    static fromMessages(promptMessages, extra) {
        const flattenedMessages = promptMessages.reduce((acc, promptMessage) => acc.concat(
        // eslint-disable-next-line no-instanceof/no-instanceof
        promptMessage instanceof ChatPromptTemplate
            ? promptMessage.promptMessages
            : [
                _coerceMessagePromptTemplateLike(promptMessage, extra),
            ]), []);
        const flattenedPartialVariables = promptMessages.reduce((acc, promptMessage) => 
        // eslint-disable-next-line no-instanceof/no-instanceof
        promptMessage instanceof ChatPromptTemplate
            ? Object.assign(acc, promptMessage.partialVariables)
            : acc, Object.create(null));
        const inputVariables = new Set();
        for (const promptMessage of flattenedMessages) {
            // eslint-disable-next-line no-instanceof/no-instanceof
            if (promptMessage instanceof index_js_1.BaseMessage)
                continue;
            for (const inputVariable of promptMessage.inputVariables) {
                if (inputVariable in flattenedPartialVariables) {
                    continue;
                }
                inputVariables.add(inputVariable);
            }
        }
        return new this({
            ...extra,
            inputVariables: [...inputVariables],
            promptMessages: flattenedMessages,
            partialVariables: flattenedPartialVariables,
            templateFormat: extra?.templateFormat,
        });
    }
    /** @deprecated Renamed to .fromMessages */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromPromptMessages(promptMessages) {
        return this.fromMessages(promptMessages);
    }
}
exports.ChatPromptTemplate = ChatPromptTemplate;
