"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombiningOutputParser = void 0;
const output_parsers_1 = require("@langchain/core/output_parsers");
/**
 * Class to combine multiple output parsers
 * @augments BaseOutputParser
 */
class CombiningOutputParser extends output_parsers_1.BaseOutputParser {
    static lc_name() {
        return "CombiningOutputParser";
    }
    constructor(fields, ...parsers) {
        if (parsers.length > 0 || !("parsers" in fields)) {
            // eslint-disable-next-line no-param-reassign
            fields = {
                parsers: [fields, ...parsers],
            };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "output_parsers", "combining"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "parsers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputDelimiter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "-----"
        });
        this.parsers = fields.parsers;
    }
    /**
     * Method to parse an input string using the parsers in the parsers array.
     * The parsed outputs are combined into a single object and returned.
     * @param input The input string to parse.
     * @param callbacks Optional Callbacks object.
     * @returns A Promise that resolves to a CombinedOutput object.
     */
    async parse(input, callbacks) {
        const inputs = input
            .trim()
            .split(new RegExp(`${this.outputDelimiter}Output \\d+${this.outputDelimiter}`))
            .slice(1);
        const ret = {};
        for (const [i, p] of this.parsers.entries()) {
            let parsed;
            try {
                let extracted = inputs[i].includes("```")
                    ? inputs[i].trim().split(/```/)[1]
                    : inputs[i].trim();
                if (extracted.endsWith(this.outputDelimiter)) {
                    extracted = extracted.slice(0, -this.outputDelimiter.length);
                }
                parsed = await p.parse(extracted, callbacks);
            }
            catch (e) {
                parsed = await p.parse(input.trim(), callbacks);
            }
            Object.assign(ret, parsed);
        }
        return ret;
    }
    /**
     * Method to get instructions on how to format the LLM output. The
     * instructions are based on the parsers array and the outputDelimiter.
     * @returns A string with format instructions.
     */
    getFormatInstructions() {
        return `${[
            `Return the following ${this.parsers.length} outputs, each formatted as described below. Include the delimiter characters "${this.outputDelimiter}" in your response:`,
            ...this.parsers.map((p, i) => `${this.outputDelimiter}Output ${i + 1}${this.outputDelimiter}\n${p
                .getFormatInstructions()
                .trim()}\n${this.outputDelimiter}`),
        ].join("\n\n")}\n`;
    }
}
exports.CombiningOutputParser = CombiningOutputParser;
