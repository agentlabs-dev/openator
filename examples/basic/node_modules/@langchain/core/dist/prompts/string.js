// Default generic "any" values are for backwards compatibility.
// Replace with "string" when we are comfortable with a breaking change.
import { StringPromptValue, } from "../prompt_values.js";
import { BasePromptTemplate } from "./base.js";
/**
 * Base class for string prompt templates. It extends the
 * BasePromptTemplate class and overrides the formatPromptValue method to
 * return a StringPromptValue.
 */
export class BaseStringPromptTemplate extends BasePromptTemplate {
    /**
     * Formats the prompt given the input values and returns a formatted
     * prompt value.
     * @param values The input values to format the prompt.
     * @returns A Promise that resolves to a formatted prompt value.
     */
    async formatPromptValue(values) {
        const formattedPrompt = await this.format(values);
        return new StringPromptValue(formattedPrompt);
    }
}
