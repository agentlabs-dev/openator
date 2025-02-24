import { MessageContent } from "../messages/index.js";
import type { InputValues } from "../utils/types/index.js";
/**
 * Type that specifies the format of a template.
 */
export type TemplateFormat = "f-string" | "mustache";
/**
 * Type that represents a node in a parsed format string. It can be either
 * a literal text or a variable name.
 */
export type ParsedTemplateNode = {
    type: "literal";
    text: string;
} | {
    type: "variable";
    name: string;
};
/**
 * Alias for `ParsedTemplateNode` since it is the same for
 * both f-string and mustache templates.
 */
export type ParsedFStringNode = ParsedTemplateNode;
export declare const parseFString: (template: string) => ParsedTemplateNode[];
export declare const parseMustache: (template: string) => ParsedTemplateNode[];
export declare const interpolateFString: (template: string, values: InputValues) => string;
export declare const interpolateMustache: (template: string, values: InputValues) => string;
/**
 * Type that represents a function that takes a template string and a set
 * of input values, and returns a string where all variables in the
 * template have been replaced with their corresponding values.
 */
type Interpolator = (template: string, values: InputValues) => string;
/**
 * Type that represents a function that takes a template string and
 * returns an array of `ParsedTemplateNode`.
 */
type Parser = (template: string) => ParsedTemplateNode[];
export declare const DEFAULT_FORMATTER_MAPPING: Record<TemplateFormat, Interpolator>;
export declare const DEFAULT_PARSER_MAPPING: Record<TemplateFormat, Parser>;
export declare const renderTemplate: (template: string, templateFormat: TemplateFormat, inputValues: InputValues) => string;
export declare const parseTemplate: (template: string, templateFormat: TemplateFormat) => ParsedTemplateNode[];
export declare const checkValidTemplate: (template: MessageContent, templateFormat: TemplateFormat, inputVariables: string[]) => void;
export {};
