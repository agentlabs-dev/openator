import { OutputParserException } from "./base.js";
import { BaseTransformOutputParser } from "./transform.js";
/**
 * Class to parse the output of an LLM call to a list.
 * @augments BaseOutputParser
 */
export class ListOutputParser extends BaseTransformOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "re", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    async *_transform(inputGenerator) {
        let buffer = "";
        for await (const input of inputGenerator) {
            if (typeof input === "string") {
                // add current chunk to buffer
                buffer += input;
            }
            else {
                // extract message content and add to buffer
                buffer += input.content;
            }
            // get parts in buffer
            if (!this.re) {
                const parts = await this.parse(buffer);
                if (parts.length > 1) {
                    // if there are multiple parts, yield all but the last one
                    for (const part of parts.slice(0, -1)) {
                        yield [part];
                    }
                    // keep the last part in the buffer
                    buffer = parts[parts.length - 1];
                }
            }
            else {
                // if there is a regex, get all matches
                const matches = [...buffer.matchAll(this.re)];
                if (matches.length > 1) {
                    let doneIdx = 0;
                    // if there are multiple matches, yield all but the last one
                    for (const match of matches.slice(0, -1)) {
                        yield [match[1]];
                        doneIdx += (match.index ?? 0) + match[0].length;
                    }
                    // keep the last match in the buffer
                    buffer = buffer.slice(doneIdx);
                }
            }
        }
        // yield the last part
        for (const part of await this.parse(buffer)) {
            yield [part];
        }
    }
}
/**
 * Class to parse the output of an LLM call as a comma-separated list.
 * @augments ListOutputParser
 */
export class CommaSeparatedListOutputParser extends ListOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "output_parsers", "list"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
    }
    static lc_name() {
        return "CommaSeparatedListOutputParser";
    }
    /**
     * Parses the given text into an array of strings, using a comma as the
     * separator. If the parsing fails, throws an OutputParserException.
     * @param text The text to parse.
     * @returns An array of strings obtained by splitting the input text at each comma.
     */
    async parse(text) {
        try {
            return text
                .trim()
                .split(",")
                .map((s) => s.trim());
        }
        catch (e) {
            throw new OutputParserException(`Could not parse output: ${text}`, text);
        }
    }
    /**
     * Provides instructions on the expected format of the response for the
     * CommaSeparatedListOutputParser.
     * @returns A string containing instructions on the expected format of the response.
     */
    getFormatInstructions() {
        return `Your response should be a list of comma separated values, eg: \`foo, bar, baz\``;
    }
}
/**
 * Class to parse the output of an LLM call to a list with a specific length and separator.
 * @augments ListOutputParser
 */
export class CustomListOutputParser extends ListOutputParser {
    constructor({ length, separator }) {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "output_parsers", "list"]
        });
        Object.defineProperty(this, "length", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "separator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.length = length;
        this.separator = separator || ",";
    }
    /**
     * Parses the given text into an array of strings, using the specified
     * separator. If the parsing fails or the number of items in the list
     * doesn't match the expected length, throws an OutputParserException.
     * @param text The text to parse.
     * @returns An array of strings obtained by splitting the input text at each occurrence of the specified separator.
     */
    async parse(text) {
        try {
            const items = text
                .trim()
                .split(this.separator)
                .map((s) => s.trim());
            if (this.length !== undefined && items.length !== this.length) {
                throw new OutputParserException(`Incorrect number of items. Expected ${this.length}, got ${items.length}.`);
            }
            return items;
        }
        catch (e) {
            if (Object.getPrototypeOf(e) === OutputParserException.prototype) {
                throw e;
            }
            throw new OutputParserException(`Could not parse output: ${text}`);
        }
    }
    /**
     * Provides instructions on the expected format of the response for the
     * CustomListOutputParser, including the number of items and the
     * separator.
     * @returns A string containing instructions on the expected format of the response.
     */
    getFormatInstructions() {
        return `Your response should be a list of ${this.length === undefined ? "" : `${this.length} `}items separated by "${this.separator}" (eg: \`foo${this.separator} bar${this.separator} baz\`)`;
    }
}
export class NumberedListOutputParser extends ListOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "output_parsers", "list"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "re", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: /\d+\.\s([^\n]+)/g
        });
    }
    static lc_name() {
        return "NumberedListOutputParser";
    }
    getFormatInstructions() {
        return `Your response should be a numbered list with each item on a new line. For example: \n\n1. foo\n\n2. bar\n\n3. baz`;
    }
    async parse(text) {
        return [...(text.matchAll(this.re) ?? [])].map((m) => m[1]);
    }
}
export class MarkdownListOutputParser extends ListOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "output_parsers", "list"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "re", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: /^\s*[-*]\s([^\n]+)$/gm
        });
    }
    static lc_name() {
        return "NumberedListOutputParser";
    }
    getFormatInstructions() {
        return `Your response should be a numbered list with each item on a new line. For example: \n\n1. foo\n\n2. bar\n\n3. baz`;
    }
    async parse(text) {
        return [...(text.matchAll(this.re) ?? [])].map((m) => m[1]);
    }
}
