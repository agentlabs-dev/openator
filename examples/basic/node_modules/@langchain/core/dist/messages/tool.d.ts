import { BaseMessage, BaseMessageChunk, type BaseMessageFields, type MessageType } from "./base.js";
export interface ToolMessageFieldsWithToolCallId extends BaseMessageFields {
    /**
     * Artifact of the Tool execution which is not meant to be sent to the model.
     *
     * Should only be specified if it is different from the message content, e.g. if only
     * a subset of the full tool output is being passed as message content but the full
     * output is needed in other parts of the code.
     */
    artifact?: any;
    tool_call_id: string;
    /**
     * Status of the tool invocation.
     * @version 0.2.19
     */
    status?: "success" | "error";
}
/**
 * Marker parameter for objects that tools can return directly.
 *
 * If a custom BaseTool is invoked with a ToolCall and the output of custom code is
 * not an instance of DirectToolOutput, the output will automatically be coerced to
 * a string and wrapped in a ToolMessage.
 */
export interface DirectToolOutput {
    readonly lc_direct_tool_output: boolean;
}
export declare function isDirectToolOutput(x: unknown): x is DirectToolOutput;
/**
 * Represents a tool message in a conversation.
 */
export declare class ToolMessage extends BaseMessage implements DirectToolOutput {
    static lc_name(): string;
    get lc_aliases(): Record<string, string>;
    lc_direct_tool_output: boolean;
    /**
     * Status of the tool invocation.
     * @version 0.2.19
     */
    status?: "success" | "error";
    tool_call_id: string;
    /**
     * Artifact of the Tool execution which is not meant to be sent to the model.
     *
     * Should only be specified if it is different from the message content, e.g. if only
     * a subset of the full tool output is being passed as message content but the full
     * output is needed in other parts of the code.
     */
    artifact?: any;
    constructor(fields: ToolMessageFieldsWithToolCallId);
    constructor(fields: string | BaseMessageFields, tool_call_id: string, name?: string);
    _getType(): MessageType;
    static isInstance(message: BaseMessage): message is ToolMessage;
    get _printableFields(): Record<string, unknown>;
}
/**
 * Represents a chunk of a tool message, which can be concatenated
 * with other tool message chunks.
 */
export declare class ToolMessageChunk extends BaseMessageChunk {
    tool_call_id: string;
    /**
     * Status of the tool invocation.
     * @version 0.2.19
     */
    status?: "success" | "error";
    /**
     * Artifact of the Tool execution which is not meant to be sent to the model.
     *
     * Should only be specified if it is different from the message content, e.g. if only
     * a subset of the full tool output is being passed as message content but the full
     * output is needed in other parts of the code.
     */
    artifact?: any;
    constructor(fields: ToolMessageFieldsWithToolCallId);
    static lc_name(): string;
    _getType(): MessageType;
    concat(chunk: ToolMessageChunk): ToolMessageChunk;
    get _printableFields(): Record<string, unknown>;
}
/**
 * A call to a tool.
 * @property {string} name - The name of the tool to be called
 * @property {Record<string, any>} args - The arguments to the tool call
 * @property {string} [id] - If provided, an identifier associated with the tool call
 */
export type ToolCall = {
    name: string;
    args: Record<string, any>;
    id?: string;
    type?: "tool_call";
};
/**
 * A chunk of a tool call (e.g., as part of a stream).
 * When merging ToolCallChunks (e.g., via AIMessageChunk.__add__),
 * all string attributes are concatenated. Chunks are only merged if their
 * values of `index` are equal and not None.
 *
 * @example
 * ```ts
 * const leftChunks = [
 *   {
 *     name: "foo",
 *     args: '{"a":',
 *     index: 0
 *   }
 * ];
 *
 * const leftAIMessageChunk = new AIMessageChunk({
 *   content: "",
 *   tool_call_chunks: leftChunks
 * });
 *
 * const rightChunks = [
 *   {
 *     name: undefined,
 *     args: '1}',
 *     index: 0
 *   }
 * ];
 *
 * const rightAIMessageChunk = new AIMessageChunk({
 *   content: "",
 *   tool_call_chunks: rightChunks
 * });
 *
 * const result = leftAIMessageChunk.concat(rightAIMessageChunk);
 * // result.tool_call_chunks is equal to:
 * // [
 * //   {
 * //     name: "foo",
 * //     args: '{"a":1}'
 * //     index: 0
 * //   }
 * // ]
 * ```
 *
 * @property {string} [name] - If provided, a substring of the name of the tool to be called
 * @property {string} [args] - If provided, a JSON substring of the arguments to the tool call
 * @property {string} [id] - If provided, a substring of an identifier for the tool call
 * @property {number} [index] - If provided, the index of the tool call in a sequence
 */
export type ToolCallChunk = {
    name?: string;
    args?: string;
    id?: string;
    index?: number;
    type?: "tool_call_chunk";
};
export type InvalidToolCall = {
    name?: string;
    args?: string;
    id?: string;
    error?: string;
    type?: "invalid_tool_call";
};
export declare function defaultToolCallParser(rawToolCalls: Record<string, any>[]): [ToolCall[], InvalidToolCall[]];
export declare function isToolMessage(x: BaseMessage): x is ToolMessage;
export declare function isToolMessageChunk(x: BaseMessageChunk): x is ToolMessageChunk;
