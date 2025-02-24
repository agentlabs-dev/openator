import Handlebars from "handlebars";
import { CustomFormatPromptTemplate, } from "./custom_format.js";
export const parseHandlebars = (template) => {
    const parsed = [];
    const nodes = [...Handlebars.parse(template).body];
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
export const interpolateHandlebars = (template, values) => {
    const compiled = Handlebars.compile(template, { noEscape: true });
    return compiled(values);
};
export class HandlebarsPromptTemplate extends CustomFormatPromptTemplate {
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
            customParser: parseHandlebars,
            renderer: interpolateHandlebars,
        });
    }
}
