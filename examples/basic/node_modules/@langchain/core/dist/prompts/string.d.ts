import type { InputValues } from "../utils/types/index.js";
import { type StringPromptValueInterface } from "../prompt_values.js";
import { BasePromptTemplate, type TypedPromptInputValues } from "./base.js";
/**
 * Base class for string prompt templates. It extends the
 * BasePromptTemplate class and overrides the formatPromptValue method to
 * return a StringPromptValue.
 */
export declare abstract class BaseStringPromptTemplate<RunInput extends InputValues = any, PartialVariableName extends string = any> extends BasePromptTemplate<RunInput, StringPromptValueInterface, PartialVariableName> {
    /**
     * Formats the prompt given the input values and returns a formatted
     * prompt value.
     * @param values The input values to format the prompt.
     * @returns A Promise that resolves to a formatted prompt value.
     */
    formatPromptValue(values: TypedPromptInputValues<RunInput>): Promise<StringPromptValueInterface>;
}
