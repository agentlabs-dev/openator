import { BaseOutputParser, OutputParserException, } from "@langchain/core/output_parsers";
/**
 * Class to parse the output of an LLM call into a dictionary.
 * @augments BaseOutputParser
 */
export class RegexParser extends BaseOutputParser {
    static lc_name() {
        return "RegexParser";
    }
    get lc_attributes() {
        return {
            regex: this.lc_kwargs.regex,
        };
    }
    constructor(fields, outputKeys, defaultOutputKey) {
        // eslint-disable-next-line no-instanceof/no-instanceof
        if (typeof fields === "string" || fields instanceof RegExp) {
            // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-non-null-assertion
            fields = { regex: fields, outputKeys: outputKeys, defaultOutputKey };
        }
        // eslint-disable-next-line no-instanceof/no-instanceof
        if (fields.regex instanceof RegExp) {
            // eslint-disable-next-line no-param-reassign
            fields.regex = {
                pattern: fields.regex.source,
                flags: fields.regex.flags,
            };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "output_parsers", "regex"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "regex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputKeys", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "defaultOutputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.regex =
            // eslint-disable-next-line no-nested-ternary
            typeof fields.regex === "string"
                ? new RegExp(fields.regex)
                : "pattern" in fields.regex
                    ? new RegExp(fields.regex.pattern, fields.regex.flags)
                    : fields.regex;
        this.outputKeys = fields.outputKeys;
        this.defaultOutputKey = fields.defaultOutputKey;
    }
    _type() {
        return "regex_parser";
    }
    /**
     * Parses the given text using the regex pattern and returns a dictionary
     * with the parsed output. If the regex pattern does not match the text
     * and no defaultOutputKey is provided, throws an OutputParserException.
     * @param text The text to be parsed.
     * @returns A dictionary with the parsed output.
     */
    async parse(text) {
        const match = text.match(this.regex);
        if (match) {
            return this.outputKeys.reduce((acc, key, index) => {
                acc[key] = match[index + 1];
                return acc;
            }, {});
        }
        if (this.defaultOutputKey === undefined) {
            throw new OutputParserException(`Could not parse output: ${text}`, text);
        }
        return this.outputKeys.reduce((acc, key) => {
            acc[key] = key === this.defaultOutputKey ? text : "";
            return acc;
        }, {});
    }
    /**
     * Returns a string with instructions on how the LLM output should be
     * formatted to match the regex pattern.
     * @returns A string with formatting instructions.
     */
    getFormatInstructions() {
        return `Your response should match the following regex: ${this.regex}`;
    }
}
