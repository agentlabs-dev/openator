import { z } from "zod";
import { CallbackManagerForToolRun, Callbacks } from "../callbacks/manager.js";
import { BaseLangChain, type BaseLangChainParams } from "../language_models/base.js";
import { type RunnableConfig } from "../runnables/config.js";
import type { RunnableFunc, RunnableInterface } from "../runnables/base.js";
import { ToolCall } from "../messages/tool.js";
import { MessageContent } from "../messages/base.js";
import { ToolInputParsingException } from "./utils.js";
export { ToolInputParsingException };
export type ResponseFormat = "content" | "content_and_artifact" | string;
type ToolReturnType = any;
export type ContentAndArtifact = [MessageContent, any];
type ZodObjectAny = z.ZodObject<any, any, any, any>;
/**
 * Parameters for the Tool classes.
 */
export interface ToolParams extends BaseLangChainParams {
    /**
     * The tool response format.
     *
     * If "content" then the output of the tool is interpreted as the contents of a
     * ToolMessage. If "content_and_artifact" then the output is expected to be a
     * two-tuple corresponding to the (content, artifact) of a ToolMessage.
     *
     * @default "content"
     */
    responseFormat?: ResponseFormat;
    /**
     * Whether to show full details in the thrown parsing errors.
     *
     * @default false
     */
    verboseParsingErrors?: boolean;
}
export type ToolRunnableConfig<ConfigurableFieldType extends Record<string, any> = Record<string, any>> = RunnableConfig<ConfigurableFieldType> & {
    toolCall?: ToolCall;
};
/**
 * Schema for defining tools.
 *
 * @version 0.2.19
 */
export interface StructuredToolParams extends Pick<StructuredToolInterface, "name" | "schema"> {
    /**
     * An optional description of the tool to pass to the model.
     */
    description?: string;
}
export interface StructuredToolInterface<T extends ZodObjectAny = ZodObjectAny> extends RunnableInterface<(z.output<T> extends string ? string : never) | z.input<T> | ToolCall, ToolReturnType> {
    lc_namespace: string[];
    /**
     * A Zod schema representing the parameters of the tool.
     */
    schema: T | z.ZodEffects<T>;
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
    call(arg: (z.output<T> extends string ? string : never) | z.input<T> | ToolCall, configArg?: Callbacks | RunnableConfig, 
    /** @deprecated */
    tags?: string[]): Promise<ToolReturnType>;
    /**
     * The name of the tool.
     */
    name: string;
    /**
     * A description of the tool.
     */
    description: string;
    /**
     * Whether to return the tool's output directly.
     *
     * Setting this to true means that after the tool is called,
     * an agent should stop looping.
     */
    returnDirect: boolean;
}
/**
 * Base class for Tools that accept input of any shape defined by a Zod schema.
 */
export declare abstract class StructuredTool<T extends ZodObjectAny = ZodObjectAny> extends BaseLangChain<(z.output<T> extends string ? string : never) | z.input<T> | ToolCall, ToolReturnType> {
    abstract name: string;
    abstract description: string;
    abstract schema: T | z.ZodEffects<T>;
    /**
     * Whether to return the tool's output directly.
     *
     * Setting this to true means that after the tool is called,
     * an agent should stop looping.
     */
    returnDirect: boolean;
    verboseParsingErrors: boolean;
    get lc_namespace(): string[];
    /**
     * The tool response format.
     *
     * If "content" then the output of the tool is interpreted as the contents of a
     * ToolMessage. If "content_and_artifact" then the output is expected to be a
     * two-tuple corresponding to the (content, artifact) of a ToolMessage.
     *
     * @default "content"
     */
    responseFormat?: ResponseFormat;
    constructor(fields?: ToolParams);
    protected abstract _call(arg: z.output<T>, runManager?: CallbackManagerForToolRun, parentConfig?: ToolRunnableConfig): Promise<ToolReturnType>;
    /**
     * Invokes the tool with the provided input and configuration.
     * @param input The input for the tool.
     * @param config Optional configuration for the tool.
     * @returns A Promise that resolves with a string.
     */
    invoke(input: (z.output<T> extends string ? string : never) | z.input<T> | ToolCall, config?: RunnableConfig): Promise<ToolReturnType>;
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
    call(arg: (z.output<T> extends string ? string : never) | z.input<T>, configArg?: Callbacks | ToolRunnableConfig, 
    /** @deprecated */
    tags?: string[]): Promise<ToolReturnType>;
}
export interface ToolInterface<T extends ZodObjectAny = ZodObjectAny> extends StructuredToolInterface<T> {
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.3.0.
     *
     * Calls the tool with the provided argument and callbacks. It handles
     * string inputs specifically.
     * @param arg The input argument for the tool, which can be a string, undefined, or an input of the tool's schema.
     * @param callbacks Optional callbacks for the tool.
     * @returns A Promise that resolves with a string.
     */
    call(arg: string | undefined | z.input<this["schema"]> | ToolCall, callbacks?: Callbacks | RunnableConfig): Promise<ToolReturnType>;
}
/**
 * Base class for Tools that accept input as a string.
 */
export declare abstract class Tool extends StructuredTool<ZodObjectAny> {
    schema: z.ZodEffects<z.ZodObject<{
        input: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        input?: string | undefined;
    }, {
        input?: string | undefined;
    }>, string | undefined, {
        input?: string | undefined;
    }>;
    constructor(fields?: ToolParams);
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.3.0.
     *
     * Calls the tool with the provided argument and callbacks. It handles
     * string inputs specifically.
     * @param arg The input argument for the tool, which can be a string, undefined, or an input of the tool's schema.
     * @param callbacks Optional callbacks for the tool.
     * @returns A Promise that resolves with a string.
     */
    call(arg: string | undefined | z.input<this["schema"]> | ToolCall, callbacks?: Callbacks | RunnableConfig): Promise<ToolReturnType>;
}
export interface BaseDynamicToolInput extends ToolParams {
    name: string;
    description: string;
    /**
     * Whether to return the tool's output directly.
     *
     * Setting this to true means that after the tool is called,
     * an agent should stop looping.
     */
    returnDirect?: boolean;
}
/**
 * Interface for the input parameters of the DynamicTool class.
 */
export interface DynamicToolInput extends BaseDynamicToolInput {
    func: (input: string, runManager?: CallbackManagerForToolRun, config?: ToolRunnableConfig) => Promise<ToolReturnType>;
}
/**
 * Interface for the input parameters of the DynamicStructuredTool class.
 */
export interface DynamicStructuredToolInput<T extends ZodObjectAny | Record<string, any> = ZodObjectAny> extends BaseDynamicToolInput {
    func: (input: BaseDynamicToolInput["responseFormat"] extends "content_and_artifact" ? ToolCall : T extends ZodObjectAny ? z.infer<T> : T, runManager?: CallbackManagerForToolRun, config?: RunnableConfig) => Promise<ToolReturnType>;
    schema: T extends ZodObjectAny ? T : T;
}
/**
 * A tool that can be created dynamically from a function, name, and description.
 */
export declare class DynamicTool extends Tool {
    static lc_name(): string;
    name: string;
    description: string;
    func: DynamicToolInput["func"];
    constructor(fields: DynamicToolInput);
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.3.0.
     */
    call(arg: string | undefined | z.input<this["schema"]> | ToolCall, configArg?: ToolRunnableConfig | Callbacks): Promise<ToolReturnType>;
    /** @ignore */
    _call(input: string, runManager?: CallbackManagerForToolRun, parentConfig?: ToolRunnableConfig): Promise<ToolReturnType>;
}
/**
 * A tool that can be created dynamically from a function, name, and
 * description, designed to work with structured data. It extends the
 * StructuredTool class and overrides the _call method to execute the
 * provided function when the tool is called.
 *
 * Schema can be passed as Zod or JSON schema. The tool will not validate
 * input if JSON schema is passed.
 */
export declare class DynamicStructuredTool<T extends ZodObjectAny | Record<string, any> = ZodObjectAny> extends StructuredTool<T extends ZodObjectAny ? T : ZodObjectAny> {
    static lc_name(): string;
    name: string;
    description: string;
    func: DynamicStructuredToolInput<T>["func"];
    schema: T extends ZodObjectAny ? T : ZodObjectAny;
    constructor(fields: DynamicStructuredToolInput<T>);
    /**
     * @deprecated Use .invoke() instead. Will be removed in 0.3.0.
     */
    call(arg: (T extends ZodObjectAny ? z.output<T> : T) | ToolCall, configArg?: RunnableConfig | Callbacks, 
    /** @deprecated */
    tags?: string[]): Promise<ToolReturnType>;
    protected _call(arg: (T extends ZodObjectAny ? z.output<T> : T) | ToolCall, runManager?: CallbackManagerForToolRun, parentConfig?: RunnableConfig): Promise<ToolReturnType>;
}
/**
 * Abstract base class for toolkits in LangChain. Toolkits are collections
 * of tools that agents can use. Subclasses must implement the `tools`
 * property to provide the specific tools for the toolkit.
 */
export declare abstract class BaseToolkit {
    abstract tools: StructuredToolInterface[];
    getTools(): StructuredToolInterface[];
}
/**
 * Parameters for the tool function.
 * Schema can be provided as Zod or JSON schema.
 * If you pass JSON schema, tool inputs will not be validated.
 * @template {ZodObjectAny | z.ZodString | Record<string, any> = ZodObjectAny} RunInput The input schema for the tool. Either any Zod object, a Zod string, or JSON schema.
 */
interface ToolWrapperParams<RunInput extends ZodObjectAny | z.ZodString | Record<string, any> = ZodObjectAny> extends ToolParams {
    /**
     * The name of the tool. If using with an LLM, this
     * will be passed as the tool name.
     */
    name: string;
    /**
     * The description of the tool.
     * @default `${fields.name} tool`
     */
    description?: string;
    /**
     * The input schema for the tool. If using an LLM, this
     * will be passed as the tool schema to generate arguments
     * for.
     */
    schema?: RunInput;
    /**
     * The tool response format.
     *
     * If "content" then the output of the tool is interpreted as the contents of a
     * ToolMessage. If "content_and_artifact" then the output is expected to be a
     * two-tuple corresponding to the (content, artifact) of a ToolMessage.
     *
     * @default "content"
     */
    responseFormat?: ResponseFormat;
    /**
     * Whether to return the tool's output directly.
     *
     * Setting this to true means that after the tool is called,
     * an agent should stop looping.
     */
    returnDirect?: boolean;
}
/**
 * Creates a new StructuredTool instance with the provided function, name, description, and schema.
 *
 * Schema can be provided as Zod or JSON schema.
 * If you pass JSON schema, tool inputs will not be validated.
 *
 * @function
 * @template {ZodObjectAny | z.ZodString | Record<string, any> = ZodObjectAny} T The input schema for the tool. Either any Zod object, a Zod string, or JSON schema instance.
 *
 * @param {RunnableFunc<z.output<T>, ToolReturnType>} func - The function to invoke when the tool is called.
 * @param {ToolWrapperParams<T>} fields - An object containing the following properties:
 * @param {string} fields.name The name of the tool.
 * @param {string | undefined} fields.description The description of the tool. Defaults to either the description on the Zod schema, or `${fields.name} tool`.
 * @param {ZodObjectAny | z.ZodString | undefined} fields.schema The Zod schema defining the input for the tool. If undefined, it will default to a Zod string schema.
 *
 * @returns {DynamicStructuredTool<T>} A new StructuredTool instance.
 */
export declare function tool<T extends z.ZodString>(func: RunnableFunc<z.output<T>, ToolReturnType, ToolRunnableConfig>, fields: ToolWrapperParams<T>): DynamicTool;
export declare function tool<T extends ZodObjectAny>(func: RunnableFunc<z.output<T>, ToolReturnType, ToolRunnableConfig>, fields: ToolWrapperParams<T>): DynamicStructuredTool<T>;
export declare function tool<T extends Record<string, any>>(func: RunnableFunc<T, ToolReturnType, ToolRunnableConfig>, fields: ToolWrapperParams<T>): DynamicStructuredTool<T>;
