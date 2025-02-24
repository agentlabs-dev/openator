"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tool = exports.BaseToolkit = exports.DynamicStructuredTool = exports.DynamicTool = exports.Tool = exports.StructuredTool = exports.ToolInputParsingException = void 0;
const zod_1 = require("zod");
const manager_js_1 = require("../callbacks/manager.cjs");
const base_js_1 = require("../language_models/base.cjs");
const config_js_1 = require("../runnables/config.cjs");
const tool_js_1 = require("../messages/tool.cjs");
const index_js_1 = require("../singletons/index.cjs");
const utils_js_1 = require("./utils.cjs");
Object.defineProperty(exports, "ToolInputParsingException", { enumerable: true, get: function () { return utils_js_1.ToolInputParsingException; } });
const is_zod_schema_js_1 = require("../utils/types/is_zod_schema.cjs");
/**
 * Base class for Tools that accept input of any shape defined by a Zod schema.
 */
class StructuredTool extends base_js_1.BaseLangChain {
    get lc_namespace() {
        return ["langchain", "tools"];
    }
    constructor(fields) {
        super(fields ?? {});
        /**
         * Whether to return the tool's output directly.
         *
         * Setting this to true means that after the tool is called,
         * an agent should stop looping.
         */
        Object.defineProperty(this, "returnDirect", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "verboseParsingErrors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        /**
         * The tool response format.
         *
         * If "content" then the output of the tool is interpreted as the contents of a
         * ToolMessage. If "content_and_artifact" then the output is expected to be a
         * two-tuple corresponding to the (content, artifact) of a ToolMessage.
         *
         * @default "content"
         */
        Object.defineProperty(this, "responseFormat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "content"
        });
        this.verboseParsingErrors =
            fields?.verboseParsingErrors ?? this.verboseParsingErrors;
        this.responseFormat = fields?.responseFormat ?? this.responseFormat;
    }
    /**
     * Invokes the tool with the provided input and configuration.
     * @param input The input for the tool.
     * @param config Optional configuration for the tool.
     * @returns A Promise that resolves with a string.
     */
    async invoke(input, config) {
        let tool_call_id;
        let toolInput;
        let enrichedConfig = (0, config_js_1.ensureConfig)(config);
        if ((0, utils_js_1._isToolCall)(input)) {
            tool_call_id = input.id;
            toolInput = input.args;
            enrichedConfig = {
                ...enrichedConfig,
                toolCall: input,
                configurable: {
                    ...enrichedConfig.configurable,
                    tool_call_id,
                },
            };
        }
        else {
            toolInput = input;
        }
        return this.call(toolInput, enrichedConfig);
    }
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.3.0.
     *
     * Calls the tool with the provided argument, configuration, and tags. It
     * parses the input according to the schema, handles any errors, and
     * manages callbacks.
     * @param arg The input argument for the tool.
     * @param configArg Optional configuration or callbacks for the tool.
     * @param tags Optional tags for the tool.
     * @returns A Promise that resolves with a string.
     */
    async call(arg, configArg, 
    /** @deprecated */
    tags) {
        let parsed;
        try {
            parsed = await this.schema.parseAsync(arg);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (e) {
            let message = `Received tool input did not match expected schema`;
            if (this.verboseParsingErrors) {
                message = `${message}\nDetails: ${e.message}`;
            }
            throw new utils_js_1.ToolInputParsingException(message, JSON.stringify(arg));
        }
        const config = (0, manager_js_1.parseCallbackConfigArg)(configArg);
        const callbackManager_ = manager_js_1.CallbackManager.configure(config.callbacks, this.callbacks, config.tags || tags, this.tags, config.metadata, this.metadata, { verbose: this.verbose });
        const runManager = await callbackManager_?.handleToolStart(this.toJSON(), typeof parsed === "string" ? parsed : JSON.stringify(parsed), config.runId, undefined, undefined, undefined, config.runName);
        delete config.runId;
        let result;
        try {
            result = await this._call(parsed, runManager, config);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (e) {
            await runManager?.handleToolError(e);
            throw e;
        }
        let content;
        let artifact;
        if (this.responseFormat === "content_and_artifact") {
            if (Array.isArray(result) && result.length === 2) {
                [content, artifact] = result;
            }
            else {
                throw new Error(`Tool response format is "content_and_artifact" but the output was not a two-tuple.\nResult: ${JSON.stringify(result)}`);
            }
        }
        else {
            content = result;
        }
        let toolCallId;
        if (config && "configurable" in config) {
            toolCallId = config.configurable
                .tool_call_id;
        }
        const formattedOutput = _formatToolOutput({
            content,
            artifact,
            toolCallId,
            name: this.name,
        });
        await runManager?.handleToolEnd(formattedOutput);
        return formattedOutput;
    }
}
exports.StructuredTool = StructuredTool;
/**
 * Base class for Tools that accept input as a string.
 */
class Tool extends StructuredTool {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "schema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: zod_1.z
                .object({ input: zod_1.z.string().optional() })
                .transform((obj) => obj.input)
        });
    }
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.3.0.
     *
     * Calls the tool with the provided argument and callbacks. It handles
     * string inputs specifically.
     * @param arg The input argument for the tool, which can be a string, undefined, or an input of the tool's schema.
     * @param callbacks Optional callbacks for the tool.
     * @returns A Promise that resolves with a string.
     */
    call(arg, callbacks) {
        return super.call(typeof arg === "string" || !arg ? { input: arg } : arg, callbacks);
    }
}
exports.Tool = Tool;
/**
 * A tool that can be created dynamically from a function, name, and description.
 */
class DynamicTool extends Tool {
    static lc_name() {
        return "DynamicTool";
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "func", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = fields.name;
        this.description = fields.description;
        this.func = fields.func;
        this.returnDirect = fields.returnDirect ?? this.returnDirect;
    }
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.3.0.
     */
    async call(arg, configArg) {
        const config = (0, manager_js_1.parseCallbackConfigArg)(configArg);
        if (config.runName === undefined) {
            config.runName = this.name;
        }
        return super.call(arg, config);
    }
    /** @ignore */
    async _call(input, runManager, parentConfig) {
        return this.func(input, runManager, parentConfig);
    }
}
exports.DynamicTool = DynamicTool;
/**
 * A tool that can be created dynamically from a function, name, and
 * description, designed to work with structured data. It extends the
 * StructuredTool class and overrides the _call method to execute the
 * provided function when the tool is called.
 *
 * Schema can be passed as Zod or JSON schema. The tool will not validate
 * input if JSON schema is passed.
 */
class DynamicStructuredTool extends StructuredTool {
    static lc_name() {
        return "DynamicStructuredTool";
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "func", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "schema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = fields.name;
        this.description = fields.description;
        this.func = fields.func;
        this.returnDirect = fields.returnDirect ?? this.returnDirect;
        this.schema = ((0, is_zod_schema_js_1.isZodSchema)(fields.schema) ? fields.schema : zod_1.z.object({}).passthrough());
    }
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.3.0.
     */
    async call(arg, configArg, 
    /** @deprecated */
    tags) {
        const config = (0, manager_js_1.parseCallbackConfigArg)(configArg);
        if (config.runName === undefined) {
            config.runName = this.name;
        }
        return super.call(arg, config, tags);
    }
    _call(arg, runManager, parentConfig) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.func(arg, runManager, parentConfig);
    }
}
exports.DynamicStructuredTool = DynamicStructuredTool;
/**
 * Abstract base class for toolkits in LangChain. Toolkits are collections
 * of tools that agents can use. Subclasses must implement the `tools`
 * property to provide the specific tools for the toolkit.
 */
class BaseToolkit {
    getTools() {
        return this.tools;
    }
}
exports.BaseToolkit = BaseToolkit;
function tool(func, fields) {
    // If the schema is not provided, or it's a string schema, create a DynamicTool
    if (!fields.schema ||
        ((0, is_zod_schema_js_1.isZodSchema)(fields.schema) &&
            (!("shape" in fields.schema) || !fields.schema.shape))) {
        return new DynamicTool({
            ...fields,
            description: fields.description ??
                fields.schema?.description ??
                `${fields.name} tool`,
            func: async (input, runManager, config) => {
                return new Promise((resolve, reject) => {
                    const childConfig = (0, config_js_1.patchConfig)(config, {
                        callbacks: runManager?.getChild(),
                    });
                    void index_js_1.AsyncLocalStorageProviderSingleton.runWithConfig((0, config_js_1.pickRunnableConfigKeys)(childConfig), async () => {
                        try {
                            // TS doesn't restrict the type here based on the guard above
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            resolve(func(input, childConfig));
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                });
            },
        });
    }
    const description = fields.description ?? fields.schema.description ?? `${fields.name} tool`;
    return new DynamicStructuredTool({
        ...fields,
        description,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schema: fields.schema,
        // TODO: Consider moving into DynamicStructuredTool constructor
        func: async (input, runManager, config) => {
            return new Promise((resolve, reject) => {
                const childConfig = (0, config_js_1.patchConfig)(config, {
                    callbacks: runManager?.getChild(),
                });
                void index_js_1.AsyncLocalStorageProviderSingleton.runWithConfig((0, config_js_1.pickRunnableConfigKeys)(childConfig), async () => {
                    try {
                        // TS doesn't restrict the type here based on the guard above
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        resolve(func(input, childConfig));
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            });
        },
    });
}
exports.tool = tool;
function _formatToolOutput(params) {
    const { content, artifact, toolCallId } = params;
    if (toolCallId && !(0, tool_js_1.isDirectToolOutput)(content)) {
        if (typeof content === "string" ||
            (Array.isArray(content) &&
                content.every((item) => typeof item === "object"))) {
            return new tool_js_1.ToolMessage({
                content,
                artifact,
                tool_call_id: toolCallId,
                name: params.name,
            });
        }
        else {
            return new tool_js_1.ToolMessage({
                content: _stringify(content),
                artifact,
                tool_call_id: toolCallId,
                name: params.name,
            });
        }
    }
    else {
        return content;
    }
}
function _stringify(content) {
    try {
        return JSON.stringify(content, null, 2);
    }
    catch (_noOp) {
        return `${content}`;
    }
}
