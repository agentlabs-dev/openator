"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerpAPI = void 0;
const env_1 = require("@langchain/core/utils/env");
const tools_1 = require("@langchain/core/tools");
/**
 * Wrapper around SerpAPI.
 *
 * To use, you should have the `serpapi` package installed and the SERPAPI_API_KEY environment variable set.
 */
class SerpAPI extends tools_1.Tool {
    static lc_name() {
        return "SerpAPI";
    }
    toJSON() {
        return this.toJSONNotImplemented();
    }
    constructor(apiKey = (0, env_1.getEnvironmentVariable)("SERPAPI_API_KEY"), params = {}, baseUrl = "https://serpapi.com") {
        super(...arguments);
        Object.defineProperty(this, "key", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "params", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "search"
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "a search engine. useful for when you need to answer questions about current events. input should be a search query."
        });
        if (!apiKey) {
            throw new Error("SerpAPI API key not set. You can set it as SERPAPI_API_KEY in your .env file, or pass it to SerpAPI.");
        }
        this.key = apiKey;
        this.params = params;
        this.baseUrl = baseUrl;
    }
    /**
     * Builds a URL for the SerpAPI request.
     * @param path The path for the request.
     * @param parameters The parameters for the request.
     * @param baseUrl The base URL for the request.
     * @returns A string representing the built URL.
     */
    buildUrl(path, parameters, baseUrl) {
        const nonUndefinedParams = Object.entries(parameters)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => [key, `${value}`]);
        const searchParams = new URLSearchParams(nonUndefinedParams);
        return `${baseUrl}/${path}?${searchParams}`;
    }
    /** @ignore */
    async _call(input) {
        const { timeout, ...params } = this.params;
        const resp = await fetch(this.buildUrl("search", {
            ...params,
            api_key: this.key,
            q: input,
        }, this.baseUrl), {
            signal: timeout ? AbortSignal.timeout(timeout) : undefined,
        });
        const res = await resp.json();
        if (res.error) {
            throw new Error(`Got error from serpAPI: ${res.error}`);
        }
        const answer_box = res.answer_box_list
            ? res.answer_box_list[0]
            : res.answer_box;
        if (answer_box) {
            if (answer_box.result) {
                return answer_box.result;
            }
            else if (answer_box.answer) {
                return answer_box.answer;
            }
            else if (answer_box.snippet) {
                return answer_box.snippet;
            }
            else if (answer_box.snippet_highlighted_words) {
                return answer_box.snippet_highlighted_words.toString();
            }
            else {
                const answer = {};
                Object.keys(answer_box)
                    .filter((k) => !Array.isArray(answer_box[k]) &&
                    typeof answer_box[k] !== "object" &&
                    !(typeof answer_box[k] === "string" &&
                        answer_box[k].startsWith("http")))
                    .forEach((k) => {
                    answer[k] = answer_box[k];
                });
                return JSON.stringify(answer);
            }
        }
        if (res.events_results) {
            return JSON.stringify(res.events_results);
        }
        if (res.sports_results) {
            return JSON.stringify(res.sports_results);
        }
        if (res.top_stories) {
            return JSON.stringify(res.top_stories);
        }
        if (res.news_results) {
            return JSON.stringify(res.news_results);
        }
        if (res.jobs_results?.jobs) {
            return JSON.stringify(res.jobs_results.jobs);
        }
        if (res.questions_and_answers) {
            return JSON.stringify(res.questions_and_answers);
        }
        if (res.popular_destinations?.destinations) {
            return JSON.stringify(res.popular_destinations.destinations);
        }
        if (res.top_sights?.sights) {
            const sights = res.top_sights.sights
                .map((s) => ({
                title: s.title,
                description: s.description,
                price: s.price,
            }))
                .slice(0, 8);
            return JSON.stringify(sights);
        }
        if (res.shopping_results && res.shopping_results[0]?.title) {
            return JSON.stringify(res.shopping_results.slice(0, 3));
        }
        if (res.images_results && res.images_results[0]?.thumbnail) {
            return res.images_results
                .map((ir) => ir.thumbnail)
                .slice(0, 10)
                .toString();
        }
        const snippets = [];
        if (res.knowledge_graph) {
            if (res.knowledge_graph.description) {
                snippets.push(res.knowledge_graph.description);
            }
            const title = res.knowledge_graph.title || "";
            Object.keys(res.knowledge_graph)
                .filter((k) => typeof res.knowledge_graph[k] === "string" &&
                k !== "title" &&
                k !== "description" &&
                !k.endsWith("_stick") &&
                !k.endsWith("_link") &&
                !k.startsWith("http"))
                .forEach((k) => snippets.push(`${title} ${k}: ${res.knowledge_graph[k]}`));
        }
        const first_organic_result = res.organic_results?.[0];
        if (first_organic_result) {
            if (first_organic_result.snippet) {
                snippets.push(first_organic_result.snippet);
            }
            else if (first_organic_result.snippet_highlighted_words) {
                snippets.push(first_organic_result.snippet_highlighted_words);
            }
            else if (first_organic_result.rich_snippet) {
                snippets.push(first_organic_result.rich_snippet);
            }
            else if (first_organic_result.rich_snippet_table) {
                snippets.push(first_organic_result.rich_snippet_table);
            }
            else if (first_organic_result.link) {
                snippets.push(first_organic_result.link);
            }
        }
        if (res.buying_guide) {
            snippets.push(res.buying_guide);
        }
        if (res.local_results?.places) {
            snippets.push(res.local_results.places);
        }
        if (snippets.length > 0) {
            return JSON.stringify(snippets);
        }
        else {
            return "No good search result found";
        }
    }
}
exports.SerpAPI = SerpAPI;
