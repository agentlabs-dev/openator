"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomFormatPromptTemplate = void 0;
const prompts_1 = require("@langchain/core/prompts");
class CustomFormatPromptTemplate extends prompts_1.PromptTemplate {
    static lc_name() {
        return "CustomPromptTemplate";
    }
    constructor(input) {
        super(input);
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "templateValidator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "renderer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.assign(this, input);
        if (this.validateTemplate && this.templateValidator !== undefined) {
            let totalInputVariables = this.inputVariables;
            if (this.partialVariables) {
                totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
            }
            if (typeof this.template === "string") {
                this.templateValidator(this.template, totalInputVariables);
            }
            else {
                throw new Error(`Must pass in string as template. Received: ${this.template}`);
            }
        }
    }
    /**
     * Load prompt template from a template
     */
    static fromTemplate(template, { customParser, ...rest }) {
        const names = new Set();
        const nodes = customParser(template);
        for (const node of nodes) {
            if (node.type === "variable") {
                names.add(node.name);
            }
        }
        // eslint-disable-next-line @typescript-eslint/ban-types
        return new this({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            inputVariables: [...names],
            template,
            customParser,
            ...rest,
        });
    }
    /**
     * Formats the prompt template with the provided values.
     * @param values The values to be used to format the prompt template.
     * @returns A promise that resolves to a string which is the formatted prompt.
     */
    async format(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        if (typeof this.template === "string") {
            return this.renderer(this.template, allValues);
        }
        else {
            throw new Error(`Must pass in string as template. Received: ${this.template}`);
        }
    }
}
exports.CustomFormatPromptTemplate = CustomFormatPromptTemplate;
