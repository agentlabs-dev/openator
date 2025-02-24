import { BaseLLMOutputParser } from "@langchain/core/output_parsers";
import type { ChatGeneration } from "@langchain/core/outputs";
/**
 * @deprecated Import from "@langchain/core/output_parsers/openai_tools"
 */
export type ParsedToolCall = {
    id?: string;
    type: string;
    args: Record<string, any>;
    /** @deprecated Use `type` instead. Will be removed in 0.2.0. */
    name: string;
    /** @deprecated Use `args` instead. Will be removed in 0.2.0. */
    arguments: Record<string, any>;
};
/**
 * @deprecated Import from "@langchain/core/output_parsers/openai_tools"
 */
export type JsonOutputToolsParserParams = {
    /** Whether to return the tool call id. */
    returnId?: boolean;
};
/**
 * @deprecated Import from "@langchain/core/output_parsers/openai_tools"
 */
export declare class JsonOutputToolsParser extends BaseLLMOutputParser<ParsedToolCall[]> {
    static lc_name(): string;
    returnId: boolean;
    lc_namespace: string[];
    lc_serializable: boolean;
    constructor(fields?: JsonOutputToolsParserParams);
    /**
     * Parses the output and returns a JSON object. If `argsOnly` is true,
     * only the arguments of the function call are returned.
     * @param generations The output of the LLM to parse.
     * @returns A JSON object representation of the function call or its arguments.
     */
    parseResult(generations: ChatGeneration[]): Promise<ParsedToolCall[]>;
}
export type JsonOutputKeyToolsParserParams = {
    keyName: string;
    returnSingle?: boolean;
    /** Whether to return the tool call id. */
    returnId?: boolean;
};
/**
 * @deprecated Import from "@langchain/core/output_parsers/openai_tools"
 */
export declare class JsonOutputKeyToolsParser extends BaseLLMOutputParser<any> {
    static lc_name(): string;
    lc_namespace: string[];
    lc_serializable: boolean;
    returnId: boolean;
    /** The type of tool calls to return. */
    keyName: string;
    /** Whether to return only the first tool call. */
    returnSingle: boolean;
    initialParser: JsonOutputToolsParser;
    constructor(params: JsonOutputKeyToolsParserParams);
    parseResult(generations: ChatGeneration[]): Promise<any>;
}
