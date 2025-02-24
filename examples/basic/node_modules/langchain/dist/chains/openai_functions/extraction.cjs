"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExtractionChainFromZod = exports.createExtractionChain = void 0;
const zod_to_json_schema_1 = require("zod-to-json-schema");
const prompts_1 = require("@langchain/core/prompts");
const openai_functions_js_1 = require("../../output_parsers/openai_functions.cjs");
const llm_chain_js_1 = require("../llm_chain.cjs");
/**
 * Function that returns an array of extraction functions. These functions
 * are used to extract relevant information from a passage.
 * @param schema The schema of the function parameters.
 * @returns An array of extraction functions.
 */
function getExtractionFunctions(schema) {
    return [
        {
            name: "information_extraction",
            description: "Extracts the relevant information from the passage.",
            parameters: {
                type: "object",
                properties: {
                    info: {
                        type: "array",
                        items: {
                            type: schema.type,
                            properties: schema.properties,
                            required: schema.required,
                        },
                    },
                },
                required: ["info"],
            },
        },
    ];
}
const _EXTRACTION_TEMPLATE = `Extract and save the relevant entities mentioned in the following passage together with their properties.

Passage:
{input}
`;
/**
 * Function that creates an extraction chain using the provided JSON schema.
 * It sets up the necessary components, such as the prompt, output parser, and tags.
 * @param schema JSON schema of the function parameters.
 * @param llm Must be a ChatOpenAI or AnthropicFunctions model that supports function calling.
 * @returns A LLMChain instance configured to return data matching the schema.
 */
function createExtractionChain(schema, llm) {
    const functions = getExtractionFunctions(schema);
    const prompt = prompts_1.PromptTemplate.fromTemplate(_EXTRACTION_TEMPLATE);
    const outputParser = new openai_functions_js_1.JsonKeyOutputFunctionsParser({ attrName: "info" });
    return new llm_chain_js_1.LLMChain({
        llm,
        prompt,
        llmKwargs: { functions },
        outputParser,
        tags: ["openai_functions", "extraction"],
    });
}
exports.createExtractionChain = createExtractionChain;
/**
 * Function that creates an extraction chain from a Zod schema. It
 * converts the Zod schema to a JSON schema using zod-to-json-schema
 * before creating the extraction chain.
 * @param schema The Zod schema which extracted data should match
 * @param llm Must be a ChatOpenAI or AnthropicFunctions model that supports function calling.
 * @returns A LLMChain instance configured to return data matching the schema.
 */
function createExtractionChainFromZod(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
schema, llm) {
    return createExtractionChain((0, zod_to_json_schema_1.zodToJsonSchema)(schema), llm);
}
exports.createExtractionChainFromZod = createExtractionChainFromZod;
