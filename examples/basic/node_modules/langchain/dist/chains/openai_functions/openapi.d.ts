import { JsonSchema7Type } from "zod-to-json-schema";
import type { OpenAPIV3_1 } from "openapi-types";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BaseFunctionCallOptions } from "@langchain/core/language_models/base";
import { BasePromptTemplate } from "@langchain/core/prompts";
import { OpenAPISpec } from "../../util/openapi.js";
import { BaseChain } from "../base.js";
import { LLMChainInput } from "../llm_chain.js";
import { SequentialChain } from "../sequential_chain.js";
/**
 * Converts OpenAPI schemas to JSON schema format.
 * @param schema The OpenAPI schema to convert.
 * @param spec The OpenAPI specification that contains the schema.
 * @returns The JSON schema representation of the OpenAPI schema.
 */
export declare function convertOpenAPISchemaToJSONSchema(schema: OpenAPIV3_1.SchemaObject, spec: OpenAPISpec): JsonSchema7Type;
/**
 * Type representing the options for creating an OpenAPI chain.
 */
export type OpenAPIChainOptions = {
    llm?: BaseChatModel<BaseFunctionCallOptions>;
    prompt?: BasePromptTemplate;
    requestChain?: BaseChain;
    llmChainInputs?: LLMChainInput;
    headers?: Record<string, string>;
    params?: Record<string, string>;
    verbose?: boolean;
};
/**
 * Create a chain for querying an API from a OpenAPI spec.
 * @param spec OpenAPISpec or url/file/text string corresponding to one.
 * @param options Custom options passed into the chain
 * @returns OpenAPIChain
 */
export declare function createOpenAPIChain(spec: OpenAPIV3_1.Document | string, options?: OpenAPIChainOptions): Promise<SequentialChain>;
