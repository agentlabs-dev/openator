"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStructuredOutputRunnable = exports.createOpenAIFnRunnable = void 0;
const zod_to_json_schema_1 = require("zod-to-json-schema");
const openai_functions_js_1 = require("../../output_parsers/openai_functions.cjs");
/**
 * Creates a runnable sequence that calls OpenAI functions.
 * @param config - The parameters required to create the runnable.
 * @returns A runnable sequence that will pass the given functions to the model when run.
 *
 * @example
 * ```typescript
 * const openAIFunction = {
 *   name: "get_person_details",
 *   description: "Get details about a person",
 *   parameters: {
 *     title: "Person",
 *     description: "Identifying information about a person.",
 *     type: "object",
 *     properties: {
 *       name: { title: "Name", description: "The person's name", type: "string" },
 *       age: { title: "Age", description: "The person's age", type: "integer" },
 *       fav_food: {
 *         title: "Fav Food",
 *         description: "The person's favorite food",
 *         type: "string",
 *       },
 *     },
 *     required: ["name", "age"],
 *   },
 * };
 *
 * const model = new ChatOpenAI();
 * const prompt = ChatPromptTemplate.fromMessages([
 *   ["human", "Human description: {description}"],
 * ]);
 * const outputParser = new JsonOutputFunctionsParser();
 *
 * const runnable = createOpenAIFnRunnable({
 *   functions: [openAIFunction],
 *   llm: model,
 *   prompt,
 *   enforceSingleFunctionUsage: true, // Default is true
 *   outputParser
 * });
 * const response = await runnable.invoke({
 *   description:
 *     "My name's John Doe and I'm 30 years old. My favorite kind of food are chocolate chip cookies.",
 * });
 *
 * console.log(response);
 *
 * // { name: 'John Doe', age: 30, fav_food: 'chocolate chip cookies' }
 * ```
 */
function createOpenAIFnRunnable(config) {
    const { functions, llm, prompt, enforceSingleFunctionUsage = true, outputParser = new openai_functions_js_1.JsonOutputFunctionsParser(), } = config;
    const llmKwargs = {
        functions,
    };
    if (functions.length === 1 && enforceSingleFunctionUsage) {
        llmKwargs.function_call = {
            name: functions[0].name,
        };
    }
    const llmWithKwargs = llm.bind(llmKwargs);
    return prompt.pipe(llmWithKwargs).pipe(outputParser);
}
exports.createOpenAIFnRunnable = createOpenAIFnRunnable;
function isZodSchema(schema) {
    return typeof schema.safeParse === "function";
}
/**
 * @deprecated Prefer the `.withStructuredOutput` method on chat model classes.
 *
 * Create a runnable that uses an OpenAI function to get a structured output.
 * @param config Params required to create the runnable.
 * @returns A runnable sequence that will pass the given function to the model when run.
 *
 * @example
 * ```typescript
 * import { createStructuredOutputRunnable } from "langchain/chains/openai_functions";
 * import { ChatOpenAI } from "@langchain/openai";
 * import { ChatPromptTemplate } from "@langchain/core/prompts";
 * import { JsonOutputFunctionsParser } from "langchain/output_parsers";
 *
 * const jsonSchema = {
 *   title: "Person",
 *   description: "Identifying information about a person.",
 *   type: "object",
 *   properties: {
 *     name: { title: "Name", description: "The person's name", type: "string" },
 *     age: { title: "Age", description: "The person's age", type: "integer" },
 *     fav_food: {
 *       title: "Fav Food",
 *       description: "The person's favorite food",
 *       type: "string",
 *     },
 *   },
 *   required: ["name", "age"],
 * };
 *
 * const model = new ChatOpenAI();
 * const prompt = ChatPromptTemplate.fromMessages([
 *   ["human", "Human description: {description}"],
 * ]);
 *
 * const outputParser = new JsonOutputFunctionsParser();
 *
 * // Also works with Zod schema
 * const runnable = createStructuredOutputRunnable({
 *   outputSchema: jsonSchema,
 *   llm: model,
 *   prompt,
 *   outputParser
 * });
 *
 * const response = await runnable.invoke({
 *   description:
 *     "My name's John Doe and I'm 30 years old. My favorite kind of food are chocolate chip cookies.",
 * });
 *
 * console.log(response);
 *
 * // { name: 'John Doe', age: 30, fav_food: 'chocolate chip cookies' }
 * ```
 */
function createStructuredOutputRunnable(config) {
    const { outputSchema, llm, prompt, outputParser } = config;
    const jsonSchema = isZodSchema(outputSchema)
        ? (0, zod_to_json_schema_1.zodToJsonSchema)(outputSchema)
        : outputSchema;
    const oaiFunction = {
        name: "outputFormatter",
        description: "Output formatter. Should always be used to format your response to the user",
        parameters: jsonSchema,
    };
    return createOpenAIFnRunnable({
        functions: [oaiFunction],
        llm,
        prompt,
        enforceSingleFunctionUsage: true,
        outputParser,
    });
}
exports.createStructuredOutputRunnable = createStructuredOutputRunnable;
