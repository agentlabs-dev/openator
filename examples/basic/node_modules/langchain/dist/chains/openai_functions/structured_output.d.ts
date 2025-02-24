import { z } from "zod";
import { JsonSchema7Type } from "zod-to-json-schema";
import { Validator } from "@langchain/core/utils/json_schema";
import { ChatOpenAI } from "@langchain/openai";
import { BasePromptTemplate } from "@langchain/core/prompts";
import { BaseLLMOutputParser } from "@langchain/core/output_parsers";
import { ChatGeneration } from "@langchain/core/outputs";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { BaseFunctionCallOptions } from "@langchain/core/language_models/base";
import { LLMChain, type LLMChainInput } from "../llm_chain.js";
import { OutputFunctionsParser } from "../../output_parsers/openai_functions.js";
/**
 * Type representing the input for creating a structured output chain. It
 * extends the LLMChainInput type and includes an additional
 * 'outputSchema' field representing the JSON schema for the expected
 * output.
 */
export type StructuredOutputChainInput<T extends z.AnyZodObject = z.AnyZodObject> = Omit<LLMChainInput, "outputParser" | "llm"> & {
    outputSchema?: JsonSchema7Type;
    prompt: BasePromptTemplate;
    llm?: BaseChatModel<BaseFunctionCallOptions>;
    zodSchema?: T;
};
export type FunctionCallStructuredOutputParserFields<T extends z.AnyZodObject = z.AnyZodObject> = {
    jsonSchema?: JsonSchema7Type;
    zodSchema?: T;
};
/**
 * Class that extends the BaseLLMOutputParser class. It provides
 * functionality for parsing the structured output based on a JSON schema.
 */
export declare class FunctionCallStructuredOutputParser<T extends z.AnyZodObject> extends BaseLLMOutputParser<z.infer<T>> {
    lc_namespace: string[];
    protected functionOutputParser: OutputFunctionsParser;
    protected jsonSchemaValidator?: Validator;
    protected zodSchema?: T;
    constructor(fieldsOrSchema: JsonSchema7Type);
    constructor(fieldsOrSchema: FunctionCallStructuredOutputParserFields<T>);
    /**
     * Method to parse the result of chat generations. It first parses the
     * result using the functionOutputParser, then parses the result against a
     * zod schema if the zod schema is available which allows the result to undergo
     * Zod preprocessing, then it parses that result against the JSON schema.
     * If the result is valid, it returns the parsed result. Otherwise, it throws
     * an OutputParserException.
     * @param generations Array of ChatGeneration instances to be parsed.
     * @returns The parsed result if it is valid according to the JSON schema.
     */
    parseResult(generations: ChatGeneration[]): Promise<any>;
}
/**
 * @deprecated Use {@link https://api.js.langchain.com/functions/langchain.chains_openai_functions.createStructuredOutputRunnable.html | createStructuredOutputRunnable} instead
 * Create a chain that returns output matching a JSON Schema.
 * @param input Object that includes all LLMChainInput fields except "outputParser"
 * as well as an additional required "outputSchema" JSON Schema object.
 * @returns OpenAPIChain
 */
export declare function createStructuredOutputChain<T extends z.AnyZodObject = z.AnyZodObject>(input: StructuredOutputChainInput<T>): LLMChain<any, BaseChatModel<BaseFunctionCallOptions, import("@langchain/core/messages").AIMessageChunk> | ChatOpenAI<BaseFunctionCallOptions>>;
/** @deprecated Use {@link https://api.js.langchain.com/functions/langchain.chains_openai_functions.createStructuredOutputRunnable.html | createStructuredOutputRunnable} instead */
export declare function createStructuredOutputChainFromZod<T extends z.AnyZodObject>(zodSchema: T, input: Omit<StructuredOutputChainInput<T>, "outputSchema">): LLMChain<any, BaseChatModel<BaseFunctionCallOptions, import("@langchain/core/messages").AIMessageChunk> | ChatOpenAI<BaseFunctionCallOptions>>;
