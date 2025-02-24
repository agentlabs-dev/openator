import { compare, } from "@langchain/core/utils/json_patch";
import { BaseCumulativeTransformOutputParser, BaseLLMOutputParser, OutputParserException, } from "@langchain/core/output_parsers";
import { parsePartialJson } from "@langchain/core/output_parsers";
/**
 * Class for parsing the output of an LLM. Can be configured to return
 * only the arguments of the function call in the output.
 */
export class OutputFunctionsParser extends BaseLLMOutputParser {
    static lc_name() {
        return "OutputFunctionsParser";
    }
    constructor(config) {
        super();
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "output_parsers", "openai_functions"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "argsOnly", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this.argsOnly = config?.argsOnly ?? this.argsOnly;
    }
    /**
     * Parses the output and returns a string representation of the function
     * call or its arguments.
     * @param generations The output of the LLM to parse.
     * @returns A string representation of the function call or its arguments.
     */
    async parseResult(generations) {
        if ("message" in generations[0]) {
            const gen = generations[0];
            const functionCall = gen.message.additional_kwargs.function_call;
            if (!functionCall) {
                throw new Error(`No function_call in message ${JSON.stringify(generations)}`);
            }
            if (!functionCall.arguments) {
                throw new Error(`No arguments in function_call ${JSON.stringify(generations)}`);
            }
            if (this.argsOnly) {
                return functionCall.arguments;
            }
            return JSON.stringify(functionCall);
        }
        else {
            throw new Error(`No message in generations ${JSON.stringify(generations)}`);
        }
    }
}
/**
 * Class for parsing the output of an LLM into a JSON object. Uses an
 * instance of `OutputFunctionsParser` to parse the output.
 */
export class JsonOutputFunctionsParser extends BaseCumulativeTransformOutputParser {
    static lc_name() {
        return "JsonOutputFunctionsParser";
    }
    constructor(config) {
        super(config);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "output_parsers", "openai_functions"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "argsOnly", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this.argsOnly = config?.argsOnly ?? this.argsOnly;
        this.outputParser = new OutputFunctionsParser(config);
    }
    _diff(prev, next) {
        if (!next) {
            return undefined;
        }
        const ops = compare(prev ?? {}, next);
        return ops;
    }
    async parsePartialResult(generations) {
        const generation = generations[0];
        if (!generation.message) {
            return undefined;
        }
        const { message } = generation;
        const functionCall = message.additional_kwargs.function_call;
        if (!functionCall) {
            return undefined;
        }
        if (this.argsOnly) {
            return parsePartialJson(functionCall.arguments);
        }
        return {
            ...functionCall,
            arguments: parsePartialJson(functionCall.arguments),
        };
    }
    /**
     * Parses the output and returns a JSON object. If `argsOnly` is true,
     * only the arguments of the function call are returned.
     * @param generations The output of the LLM to parse.
     * @returns A JSON object representation of the function call or its arguments.
     */
    async parseResult(generations) {
        const result = await this.outputParser.parseResult(generations);
        if (!result) {
            throw new Error(`No result from "OutputFunctionsParser" ${JSON.stringify(generations)}`);
        }
        return this.parse(result);
    }
    async parse(text) {
        try {
            const parsedResult = JSON.parse(text);
            if (this.argsOnly) {
                return parsedResult;
            }
            parsedResult.arguments = JSON.parse(parsedResult.arguments);
            return parsedResult;
        }
        catch (e) {
            throw new OutputParserException(`Failed to parse. Text: "${text}". Error: ${e}`);
        }
    }
    getFormatInstructions() {
        return "";
    }
}
/**
 * Class for parsing the output of an LLM into a JSON object and returning
 * a specific attribute. Uses an instance of `JsonOutputFunctionsParser`
 * to parse the output.
 */
export class JsonKeyOutputFunctionsParser extends BaseLLMOutputParser {
    static lc_name() {
        return "JsonKeyOutputFunctionsParser";
    }
    get lc_aliases() {
        return {
            attrName: "key_name",
        };
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "output_parsers", "openai_functions"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "outputParser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new JsonOutputFunctionsParser()
        });
        Object.defineProperty(this, "attrName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.attrName = fields.attrName;
    }
    /**
     * Parses the output and returns a specific attribute of the parsed JSON
     * object.
     * @param generations The output of the LLM to parse.
     * @returns The value of a specific attribute of the parsed JSON object.
     */
    async parseResult(generations) {
        const result = await this.outputParser.parseResult(generations);
        return result[this.attrName];
    }
}
