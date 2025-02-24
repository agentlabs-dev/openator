"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChatModel = exports.isLLM = exports.ConditionalPromptSelector = exports.BasePromptSelector = void 0;
/**
 * Abstract class that defines the interface for selecting a prompt for a
 * given language model.
 */
class BasePromptSelector {
    /**
     * Asynchronous version of `getPrompt` that also accepts an options object
     * for partial variables.
     * @param llm The language model for which to get a prompt.
     * @param options Optional object for partial variables.
     * @returns A Promise that resolves to a prompt template.
     */
    async getPromptAsync(llm, options) {
        const prompt = this.getPrompt(llm);
        return prompt.partial(options?.partialVariables ?? {});
    }
}
exports.BasePromptSelector = BasePromptSelector;
/**
 * Concrete implementation of `BasePromptSelector` that selects a prompt
 * based on a set of conditions. It has a default prompt that it returns
 * if none of the conditions are met.
 */
class ConditionalPromptSelector extends BasePromptSelector {
    constructor(default_prompt, conditionals = []) {
        super();
        Object.defineProperty(this, "defaultPrompt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "conditionals", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.defaultPrompt = default_prompt;
        this.conditionals = conditionals;
    }
    /**
     * Method that selects a prompt based on a set of conditions. If none of
     * the conditions are met, it returns the default prompt.
     * @param llm The language model for which to get a prompt.
     * @returns A prompt template.
     */
    getPrompt(llm) {
        for (const [condition, prompt] of this.conditionals) {
            if (condition(llm)) {
                return prompt;
            }
        }
        return this.defaultPrompt;
    }
}
exports.ConditionalPromptSelector = ConditionalPromptSelector;
/**
 * Type guard function that checks if a given language model is of type
 * `BaseLLM`.
 */
function isLLM(llm) {
    return llm._modelType() === "base_llm";
}
exports.isLLM = isLLM;
/**
 * Type guard function that checks if a given language model is of type
 * `BaseChatModel`.
 */
function isChatModel(llm) {
    return llm._modelType() === "base_chat_model";
}
exports.isChatModel = isChatModel;
