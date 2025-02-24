import { type ParsedFStringNode } from "@langchain/core/prompts";
import type { InputValues } from "@langchain/core/utils/types";
import { CustomFormatPromptTemplate, CustomFormatPromptTemplateInput } from "./custom_format.js";
export declare const parseHandlebars: (template: string) => ParsedFStringNode[];
export declare const interpolateHandlebars: (template: string, values: InputValues) => string;
export type HandlebarsPromptTemplateInput<RunInput extends InputValues> = CustomFormatPromptTemplateInput<RunInput>;
export declare class HandlebarsPromptTemplate<RunInput extends InputValues = any> extends CustomFormatPromptTemplate<RunInput> {
    static lc_name(): string;
    /**
     * Load prompt template from a template
     */
    static fromTemplate<RunInput extends InputValues = Record<string, any>>(template: string, params?: Omit<HandlebarsPromptTemplateInput<RunInput>, "template" | "inputVariables" | "customParser" | "templateValidator" | "renderer">): CustomFormatPromptTemplate<RunInput extends Symbol ? never : RunInput, any>;
}
