import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { Tool, type ToolParams } from "@langchain/core/tools";
/**
 * Options for the TavilySearchResults tool.
 */
export type TavilySearchAPIRetrieverFields = ToolParams & {
    maxResults?: number;
    kwargs?: Record<string, unknown>;
    apiKey?: string;
};
/**
 * Tool for the Tavily search API.
 */
export declare class TavilySearchResults extends Tool {
    static lc_name(): string;
    description: string;
    name: string;
    protected maxResults: number;
    protected apiKey?: string;
    protected kwargs: Record<string, unknown>;
    constructor(fields?: TavilySearchAPIRetrieverFields);
    protected _call(input: string, _runManager?: CallbackManagerForToolRun): Promise<string>;
}
