import { ImagePromptValue } from "../prompt_values.js";
import { BasePromptTemplate, } from "./base.js";
import { checkValidTemplate, renderTemplate, } from "./template.js";
/**
 * An image prompt template for a multimodal model.
 */
export class ImagePromptTemplate extends BasePromptTemplate {
    static lc_name() {
        return "ImagePromptTemplate";
    }
    constructor(input) {
        super(input);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "prompts", "image"]
        });
        Object.defineProperty(this, "template", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "templateFormat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "f-string"
        });
        Object.defineProperty(this, "validateTemplate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        /**
         * Additional fields which should be included inside
         * the message content array if using a complex message
         * content.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.defineProperty(this, "additionalContentFields", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.template = input.template;
        this.templateFormat = input.templateFormat ?? this.templateFormat;
        this.validateTemplate = input.validateTemplate ?? this.validateTemplate;
        this.additionalContentFields = input.additionalContentFields;
        if (this.validateTemplate) {
            let totalInputVariables = this.inputVariables;
            if (this.partialVariables) {
                totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
            }
            checkValidTemplate([
                { type: "image_url", image_url: this.template },
            ], this.templateFormat, totalInputVariables);
        }
    }
    _getPromptType() {
        return "prompt";
    }
    /**
     * Partially applies values to the prompt template.
     * @param values The values to be partially applied to the prompt template.
     * @returns A new instance of ImagePromptTemplate with the partially applied values.
     */
    async partial(values) {
        const newInputVariables = this.inputVariables.filter((iv) => !(iv in values));
        const newPartialVariables = {
            ...(this.partialVariables ?? {}),
            ...values,
        };
        const promptDict = {
            ...this,
            inputVariables: newInputVariables,
            partialVariables: newPartialVariables,
        };
        return new ImagePromptTemplate(promptDict);
    }
    /**
     * Formats the prompt template with the provided values.
     * @param values The values to be used to format the prompt template.
     * @returns A promise that resolves to a string which is the formatted prompt.
     */
    async format(values) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = {};
        for (const [key, value] of Object.entries(this.template)) {
            if (typeof value === "string") {
                formatted[key] = renderTemplate(value, this.templateFormat, values);
            }
            else {
                formatted[key] = value;
            }
        }
        const url = values.url || formatted.url;
        const detail = values.detail || formatted.detail;
        if (!url) {
            throw new Error("Must provide either an image URL.");
        }
        if (typeof url !== "string") {
            throw new Error("url must be a string.");
        }
        const output = { url };
        if (detail) {
            output.detail = detail;
        }
        return output;
    }
    /**
     * Formats the prompt given the input values and returns a formatted
     * prompt value.
     * @param values The input values to format the prompt.
     * @returns A Promise that resolves to a formatted prompt value.
     */
    async formatPromptValue(values) {
        const formattedPrompt = await this.format(values);
        return new ImagePromptValue(formattedPrompt);
    }
}
