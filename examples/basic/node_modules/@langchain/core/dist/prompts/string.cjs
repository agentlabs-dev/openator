"use strict";
// Default generic "any" values are for backwards compatibility.
// Replace with "string" when we are comfortable with a breaking change.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseStringPromptTemplate = void 0;
const prompt_values_js_1 = require("../prompt_values.cjs");
const base_js_1 = require("./base.cjs");
/**
 * Base class for string prompt templates. It extends the
 * BasePromptTemplate class and overrides the formatPromptValue method to
 * return a StringPromptValue.
 */
class BaseStringPromptTemplate extends base_js_1.BasePromptTemplate {
    /**
     * Formats the prompt given the input values and returns a formatted
     * prompt value.
     * @param values The input values to format the prompt.
     * @returns A Promise that resolves to a formatted prompt value.
     */
    async formatPromptValue(values) {
        const formattedPrompt = await this.format(values);
        return new prompt_values_js_1.StringPromptValue(formattedPrompt);
    }
}
exports.BaseStringPromptTemplate = BaseStringPromptTemplate;
