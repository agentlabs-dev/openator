import type { BaseChatModel } from "../language_models/chat_models.js";
import type { BasePromptTemplate } from "../prompts/base.js";
import type { BaseLanguageModelInterface } from "../language_models/base.js";
import type { BaseLLM } from "../language_models/llms.js";
import type { PartialValues } from "../utils/types/index.js";
export type BaseGetPromptAsyncOptions = {
    partialVariables?: PartialValues;
};
/**
 * Abstract class that defines the interface for selecting a prompt for a
 * given language model.
 */
export declare abstract class BasePromptSelector {
    /**
     * Abstract method that must be implemented by any class that extends
     * `BasePromptSelector`. It takes a language model as an argument and
     * returns a prompt template.
     * @param llm The language model for which to get a prompt.
     * @returns A prompt template.
     */
    abstract getPrompt(llm: BaseLanguageModelInterface): BasePromptTemplate;
    /**
     * Asynchronous version of `getPrompt` that also accepts an options object
     * for partial variables.
     * @param llm The language model for which to get a prompt.
     * @param options Optional object for partial variables.
     * @returns A Promise that resolves to a prompt template.
     */
    getPromptAsync(llm: BaseLanguageModelInterface, options?: BaseGetPromptAsyncOptions): Promise<BasePromptTemplate>;
}
/**
 * Concrete implementation of `BasePromptSelector` that selects a prompt
 * based on a set of conditions. It has a default prompt that it returns
 * if none of the conditions are met.
 */
export declare class ConditionalPromptSelector extends BasePromptSelector {
    defaultPrompt: BasePromptTemplate;
    conditionals: Array<[
        condition: (llm: BaseLanguageModelInterface) => boolean,
        prompt: BasePromptTemplate
    ]>;
    constructor(default_prompt: BasePromptTemplate, conditionals?: Array<[
        condition: (llm: BaseLanguageModelInterface) => boolean,
        prompt: BasePromptTemplate
    ]>);
    /**
     * Method that selects a prompt based on a set of conditions. If none of
     * the conditions are met, it returns the default prompt.
     * @param llm The language model for which to get a prompt.
     * @returns A prompt template.
     */
    getPrompt(llm: BaseLanguageModelInterface): BasePromptTemplate;
}
/**
 * Type guard function that checks if a given language model is of type
 * `BaseLLM`.
 */
export declare function isLLM(llm: BaseLanguageModelInterface): llm is BaseLLM;
/**
 * Type guard function that checks if a given language model is of type
 * `BaseChatModel`.
 */
export declare function isChatModel(llm: BaseLanguageModelInterface): llm is BaseChatModel;
