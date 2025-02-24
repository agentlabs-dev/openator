"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaggingChainFromZod = exports.createTaggingChain = void 0;
const zod_to_json_schema_1 = require("zod-to-json-schema");
const prompts_1 = require("@langchain/core/prompts");
const openai_functions_js_1 = require("../../output_parsers/openai_functions.cjs");
const llm_chain_js_1 = require("../llm_chain.cjs");
/**
 * Function that returns an array of tagging functions. These functions
 * are used to extract relevant information from a passage.
 * @param schema The schema defining the structure of function parameters.
 * @returns An array of tagging functions.
 */
function getTaggingFunctions(schema) {
    return [
        {
            name: "information_extraction",
            description: "Extracts the relevant information from the passage.",
            parameters: schema,
        },
    ];
}
const TAGGING_TEMPLATE = `Extract the desired information from the following passage.

Passage:
{input}
`;
/**
 * Function that creates a tagging chain using the provided schema,
 * LLM, and options. It constructs the LLM with the necessary
 * functions, prompt, output parser, and tags.
 * @param schema The schema defining the structure of function parameters.
 * @param llm LLM to use in the chain. Must support function calling.
 * @param options Options for creating the tagging chain.
 * @returns A new instance of LLMChain configured for tagging.
 *
 * @deprecated
 * Switch to expression language: https://js.langchain.com/docs/expression_language/
 * Will be removed in 0.2.0
 */
function createTaggingChain(schema, llm, options = {}) {
    const { prompt = prompts_1.PromptTemplate.fromTemplate(TAGGING_TEMPLATE), ...rest } = options;
    const functions = getTaggingFunctions(schema);
    const outputParser = new openai_functions_js_1.JsonOutputFunctionsParser();
    return new llm_chain_js_1.LLMChain({
        llm,
        prompt,
        llmKwargs: { functions },
        outputParser,
        tags: ["openai_functions", "tagging"],
        ...rest,
    });
}
exports.createTaggingChain = createTaggingChain;
/**
 * Function that creates a tagging chain from a Zod schema. It converts
 * the Zod schema to a JSON schema using the zodToJsonSchema function and
 * then calls createTaggingChain with the converted schema.
 * @param schema The Zod schema which extracted data should match.
 * @param llm LLM to use in the chain. Must support function calling.
 * @param options Options for creating the tagging chain.
 * @returns A new instance of LLMChain configured for tagging.
 *
 * @deprecated
 * Switch to expression language: https://js.langchain.com/docs/expression_language/
 * Will be removed in 0.2.0
 */
function createTaggingChainFromZod(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
schema, llm, options) {
    return createTaggingChain((0, zod_to_json_schema_1.zodToJsonSchema)(schema), llm, options);
}
exports.createTaggingChainFromZod = createTaggingChainFromZod;
