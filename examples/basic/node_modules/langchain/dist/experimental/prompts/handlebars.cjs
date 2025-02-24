"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlebarsPromptTemplate = exports.interpolateHandlebars = exports.parseHandlebars = void 0;
const handlebars_1 = __importDefault(require("handlebars"));
const custom_format_js_1 = require("./custom_format.cjs");
const parseHandlebars = (template) => {
    const parsed = [];
    const nodes = [...handlebars_1.default.parse(template).body];
    while (nodes.length) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const node = nodes.pop();
        if (node.type === "ContentStatement") {
            // @ts-expect-error - handlebars' hbs.AST.ContentStatement isn't exported
            const text = node.value;
            parsed.push({ type: "literal", text });
        }
        else if (node.type === "MustacheStatement") {
            // @ts-expect-error - handlebars' hbs.AST.MustacheStatement isn't exported
            const name = node.path.parts[0];
            // @ts-expect-error - handlebars' hbs.AST.MustacheStatement isn't exported
            const { original } = node.path;
            if (!!name &&
                !original.startsWith("this.") &&
                !original.startsWith("@")) {
                parsed.push({ type: "variable", name });
            }
        }
        else if (node.type === "PathExpression") {
            // @ts-expect-error - handlebars' hbs.AST.PathExpression isn't exported
            const name = node.parts[0];
            // @ts-expect-error - handlebars' hbs.AST.PathExpression isn't exported
            const { original } = node;
            if (!!name &&
                !original.startsWith("this.") &&
                !original.startsWith("@")) {
                parsed.push({ type: "variable", name });
            }
        }
        else if (node.type === "BlockStatement") {
            // @ts-expect-error - handlebars' hbs.AST.BlockStatement isn't exported
            nodes.push(...node.params, ...node.program.body);
        }
    }
    return parsed;
};
exports.parseHandlebars = parseHandlebars;
const interpolateHandlebars = (template, values) => {
    const compiled = handlebars_1.default.compile(template, { noEscape: true });
    return compiled(values);
};
exports.interpolateHandlebars = interpolateHandlebars;
class HandlebarsPromptTemplate extends custom_format_js_1.CustomFormatPromptTemplate {
    static lc_name() {
        return "HandlebarsPromptTemplate";
    }
    /**
     * Load prompt template from a template
     */
    static fromTemplate(template, params) {
        return super.fromTemplate(template, {
            ...params,
            validateTemplate: false,
            customParser: exports.parseHandlebars,
            renderer: exports.interpolateHandlebars,
        });
    }
}
exports.HandlebarsPromptTemplate = HandlebarsPromptTemplate;
