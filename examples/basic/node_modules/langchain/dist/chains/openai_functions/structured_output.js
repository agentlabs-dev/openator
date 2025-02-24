import { zodToJsonSchema } from "zod-to-json-schema";
import { Validator } from "@langchain/core/utils/json_schema";
import { ChatOpenAI } from "@langchain/openai";
import { BaseLLMOutputParser, OutputParserException, } from "@langchain/core/output_parsers";
import { LLMChain } from "../llm_chain.js";
import { OutputFunctionsParser } from "../../output_parsers/openai_functions.js";
function isJsonSchema7Type(x) {
    return (x.jsonSchema === undefined &&
        x.zodSchema === undefined);
}
/**
 * Class that extends the BaseLLMOutputParser class. It provides
 * functionality for parsing the structured output based on a JSON schema.
 */
export class FunctionCallStructuredOutputParser extends BaseLLMOutputParser {
    constructor(fieldsOrSchema) {
        let fields;
        if (isJsonSchema7Type(fieldsOrSchema)) {
            fields = { jsonSchema: fieldsOrSchema };
        }
        else {
            fields = fieldsOrSchema;
        }
        if (fields.jsonSchema === undefined && fields.zodSchema === undefined) {
            throw new Error(`Must provide at least one of "jsonSchema" or "zodSchema".`);
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "chains", "openai_functions"]
        });
        Object.defineProperty(this, "functionOutputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new OutputFunctionsParser()
        });
        Object.defineProperty(this, "jsonSchemaValidator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "zodSchema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if (fields.jsonSchema !== undefined) {
            this.jsonSchemaValidator = new Validator(fields.jsonSchema, "7");
        }
        if (fields.zodSchema !== undefined) {
            this.zodSchema = fields.zodSchema;
        }
    }
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
    async parseResult(generations) {
        const initialResult = await this.functionOutputParser.parseResult(generations);
        const parsedResult = JSON.parse(initialResult, (_, value) => {
            if (value === null) {
                return undefined;
            }
            return value;
        });
        if (this.zodSchema) {
            const zodParsedResult = this.zodSchema.safeParse(parsedResult);
            if (zodParsedResult.success) {
                return zodParsedResult.data;
            }
            else {
                throw new OutputParserException(`Failed to parse. Text: "${initialResult}". Error: ${JSON.stringify(zodParsedResult.error.errors)}`, initialResult);
            }
        }
        else if (this.jsonSchemaValidator !== undefined) {
            const result = this.jsonSchemaValidator.validate(parsedResult);
            if (result.valid) {
                return parsedResult;
            }
            else {
                throw new OutputParserException(`Failed to parse. Text: "${initialResult}". Error: ${JSON.stringify(result.errors)}`, initialResult);
            }
        }
        else {
            throw new Error("This parser requires an input JSON Schema or an input Zod schema.");
        }
    }
}
/**
 * @deprecated Use {@link https://api.js.langchain.com/functions/langchain.chains_openai_functions.createStructuredOutputRunnable.html | createStructuredOutputRunnable} instead
 * Create a chain that returns output matching a JSON Schema.
 * @param input Object that includes all LLMChainInput fields except "outputParser"
 * as well as an additional required "outputSchema" JSON Schema object.
 * @returns OpenAPIChain
 */
export function createStructuredOutputChain(input) {
    const { outputSchema, llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo-0613", temperature: 0 }), outputKey = "output", llmKwargs = {}, zodSchema, ...rest } = input;
    if (outputSchema === undefined && zodSchema === undefined) {
        throw new Error(`Must provide one of "outputSchema" or "zodSchema".`);
    }
    const functionName = "output_formatter";
    return new LLMChain({
        llm,
        llmKwargs: {
            ...llmKwargs,
            functions: [
                {
                    name: functionName,
                    description: `Output formatter. Should always be used to format your response to the user.`,
                    parameters: outputSchema,
                },
            ],
            function_call: {
                name: functionName,
            },
        },
        outputKey,
        outputParser: new FunctionCallStructuredOutputParser({
            jsonSchema: outputSchema,
            zodSchema,
        }),
        ...rest,
    });
}
/** @deprecated Use {@link https://api.js.langchain.com/functions/langchain.chains_openai_functions.createStructuredOutputRunnable.html | createStructuredOutputRunnable} instead */
export function createStructuredOutputChainFromZod(zodSchema, input) {
    return createStructuredOutputChain({
        ...input,
        outputSchema: zodToJsonSchema(zodSchema),
        zodSchema,
    });
}
