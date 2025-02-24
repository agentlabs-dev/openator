import { Tool } from "@langchain/core/tools";
import { getEnvironmentVariable } from "@langchain/core/utils/env";
/**
 * Tool for the Tavily search API.
 */
export class TavilySearchResults extends Tool {
    static lc_name() {
        return "TavilySearchResults";
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "A search engine optimized for comprehensive, accurate, and trusted results. Useful for when you need to answer questions about current events. Input should be a search query."
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "tavily_search_results_json"
        });
        Object.defineProperty(this, "maxResults", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5
        });
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "kwargs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        this.maxResults = fields?.maxResults ?? this.maxResults;
        this.kwargs = fields?.kwargs ?? this.kwargs;
        this.apiKey = fields?.apiKey ?? getEnvironmentVariable("TAVILY_API_KEY");
        if (this.apiKey === undefined) {
            throw new Error(`No Tavily API key found. Either set an environment variable named "TAVILY_API_KEY" or pass an API key as "apiKey".`);
        }
    }
    async _call(input, _runManager) {
        const body = {
            query: input,
            max_results: this.maxResults,
            api_key: this.apiKey,
        };
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ ...body, ...this.kwargs }),
        });
        const json = await response.json();
        if (!response.ok) {
            throw new Error(`Request failed with status code ${response.status}: ${json.error}`);
        }
        if (!Array.isArray(json.results)) {
            throw new Error(`Could not parse Tavily results. Please try again.`);
        }
        return JSON.stringify(json.results);
    }
}
