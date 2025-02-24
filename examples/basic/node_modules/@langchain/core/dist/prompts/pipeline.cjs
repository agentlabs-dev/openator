"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelinePromptTemplate = void 0;
const base_js_1 = require("./base.cjs");
const chat_js_1 = require("./chat.cjs");
/**
 * Class that handles a sequence of prompts, each of which may require
 * different input variables. Includes methods for formatting these
 * prompts, extracting required input values, and handling partial
 * prompts.
 * @example
 * ```typescript
 * const composedPrompt = new PipelinePromptTemplate({
 *   pipelinePrompts: [
 *     {
 *       name: "introduction",
 *       prompt: PromptTemplate.fromTemplate(`You are impersonating {person}.`),
 *     },
 *     {
 *       name: "example",
 *       prompt: PromptTemplate.fromTemplate(
 *         `Here's an example of an interaction:
 * Q: {example_q}
 * A: {example_a}`,
 *       ),
 *     },
 *     {
 *       name: "start",
 *       prompt: PromptTemplate.fromTemplate(
 *         `Now, do this for real!
 * Q: {input}
 * A:`,
 *       ),
 *     },
 *   ],
 *   finalPrompt: PromptTemplate.fromTemplate(
 *     `{introduction}
 * {example}
 * {start}`,
 *   ),
 * });
 *
 * const formattedPrompt = await composedPrompt.format({
 *   person: "Elon Musk",
 *   example_q: `What's your favorite car?`,
 *   example_a: "Tesla",
 *   input: `What's your favorite social media site?`,
 * });
 * ```
 */
class PipelinePromptTemplate extends base_js_1.BasePromptTemplate {
    static lc_name() {
        return "PipelinePromptTemplate";
    }
    constructor(input) {
        super({ ...input, inputVariables: [] });
        Object.defineProperty(this, "pipelinePrompts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "finalPrompt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.pipelinePrompts = input.pipelinePrompts;
        this.finalPrompt = input.finalPrompt;
        this.inputVariables = this.computeInputValues();
    }
    /**
     * Computes the input values required by the pipeline prompts.
     * @returns Array of input values required by the pipeline prompts.
     */
    computeInputValues() {
        const intermediateValues = this.pipelinePrompts.map((pipelinePrompt) => pipelinePrompt.name);
        const inputValues = this.pipelinePrompts
            .map((pipelinePrompt) => pipelinePrompt.prompt.inputVariables.filter((inputValue) => !intermediateValues.includes(inputValue)))
            .flat();
        return [...new Set(inputValues)];
    }
    static extractRequiredInputValues(allValues, requiredValueNames) {
        return requiredValueNames.reduce((requiredValues, valueName) => {
            // eslint-disable-next-line no-param-reassign
            requiredValues[valueName] = allValues[valueName];
            return requiredValues;
        }, {});
    }
    /**
     * Formats the pipeline prompts based on the provided input values.
     * @param values Input values to format the pipeline prompts.
     * @returns Promise that resolves with the formatted input values.
     */
    async formatPipelinePrompts(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        for (const { name: pipelinePromptName, prompt: pipelinePrompt } of this
            .pipelinePrompts) {
            const pipelinePromptInputValues = PipelinePromptTemplate.extractRequiredInputValues(allValues, pipelinePrompt.inputVariables);
            // eslint-disable-next-line no-instanceof/no-instanceof
            if (pipelinePrompt instanceof chat_js_1.ChatPromptTemplate) {
                allValues[pipelinePromptName] = await pipelinePrompt.formatMessages(pipelinePromptInputValues);
            }
            else {
                allValues[pipelinePromptName] = await pipelinePrompt.format(pipelinePromptInputValues);
            }
        }
        return PipelinePromptTemplate.extractRequiredInputValues(allValues, this.finalPrompt.inputVariables);
    }
    /**
     * Formats the final prompt value based on the provided input values.
     * @param values Input values to format the final prompt value.
     * @returns Promise that resolves with the formatted final prompt value.
     */
    async formatPromptValue(values) {
        return this.finalPrompt.formatPromptValue(await this.formatPipelinePrompts(values));
    }
    async format(values) {
        return this.finalPrompt.format(await this.formatPipelinePrompts(values));
    }
    /**
     * Handles partial prompts, which are prompts that have been partially
     * filled with input values.
     * @param values Partial input values.
     * @returns Promise that resolves with a new PipelinePromptTemplate instance with updated input variables.
     */
    async partial(values) {
        const promptDict = { ...this };
        promptDict.inputVariables = this.inputVariables.filter((iv) => !(iv in values));
        promptDict.partialVariables = {
            ...(this.partialVariables ?? {}),
            ...values,
        };
        return new PipelinePromptTemplate(promptDict);
    }
    serialize() {
        throw new Error("Not implemented.");
    }
    _getPromptType() {
        return "pipeline";
    }
}
exports.PipelinePromptTemplate = PipelinePromptTemplate;
