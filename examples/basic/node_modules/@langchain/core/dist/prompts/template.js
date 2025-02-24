import mustache from "mustache";
import { addLangChainErrorFields } from "../errors/index.js";
function configureMustache() {
    // Use unescaped HTML
    // https://github.com/janl/mustache.js?tab=readme-ov-file#variables
    mustache.escape = (text) => text;
}
export const parseFString = (template) => {
    // Core logic replicated from internals of pythons built in Formatter class.
    // https://github.com/python/cpython/blob/135ec7cefbaffd516b77362ad2b2ad1025af462e/Objects/stringlib/unicode_format.h#L700-L706
    const chars = template.split("");
    const nodes = [];
    const nextBracket = (bracket, start) => {
        for (let i = start; i < chars.length; i += 1) {
            if (bracket.includes(chars[i])) {
                return i;
            }
        }
        return -1;
    };
    let i = 0;
    while (i < chars.length) {
        if (chars[i] === "{" && i + 1 < chars.length && chars[i + 1] === "{") {
            nodes.push({ type: "literal", text: "{" });
            i += 2;
        }
        else if (chars[i] === "}" &&
            i + 1 < chars.length &&
            chars[i + 1] === "}") {
            nodes.push({ type: "literal", text: "}" });
            i += 2;
        }
        else if (chars[i] === "{") {
            const j = nextBracket("}", i);
            if (j < 0) {
                throw new Error("Unclosed '{' in template.");
            }
            nodes.push({
                type: "variable",
                name: chars.slice(i + 1, j).join(""),
            });
            i = j + 1;
        }
        else if (chars[i] === "}") {
            throw new Error("Single '}' in template.");
        }
        else {
            const next = nextBracket("{}", i);
            const text = (next < 0 ? chars.slice(i) : chars.slice(i, next)).join("");
            nodes.push({ type: "literal", text });
            i = next < 0 ? chars.length : next;
        }
    }
    return nodes;
};
/**
 * Convert the result of mustache.parse into an array of ParsedTemplateNode,
 * to make it compatible with other LangChain string parsing template formats.
 *
 * @param {mustache.TemplateSpans} template The result of parsing a mustache template with the mustache.js library.
 * @returns {ParsedTemplateNode[]}
 */
const mustacheTemplateToNodes = (template) => template.map((temp) => {
    if (temp[0] === "name") {
        const name = temp[1].includes(".") ? temp[1].split(".")[0] : temp[1];
        return { type: "variable", name };
    }
    else if (["#", "&", "^", ">"].includes(temp[0])) {
        // # represents a section, "&" represents an unescaped variable.
        // These should both be considered variables.
        return { type: "variable", name: temp[1] };
    }
    else {
        return { type: "literal", text: temp[1] };
    }
});
export const parseMustache = (template) => {
    configureMustache();
    const parsed = mustache.parse(template);
    return mustacheTemplateToNodes(parsed);
};
export const interpolateFString = (template, values) => {
    return parseFString(template).reduce((res, node) => {
        if (node.type === "variable") {
            if (node.name in values) {
                const stringValue = typeof values[node.name] === "string"
                    ? values[node.name]
                    : JSON.stringify(values[node.name]);
                return res + stringValue;
            }
            throw new Error(`(f-string) Missing value for input ${node.name}`);
        }
        return res + node.text;
    }, "");
};
export const interpolateMustache = (template, values) => {
    configureMustache();
    return mustache.render(template, values);
};
export const DEFAULT_FORMATTER_MAPPING = {
    "f-string": interpolateFString,
    mustache: interpolateMustache,
};
export const DEFAULT_PARSER_MAPPING = {
    "f-string": parseFString,
    mustache: parseMustache,
};
export const renderTemplate = (template, templateFormat, inputValues) => {
    try {
        return DEFAULT_FORMATTER_MAPPING[templateFormat](template, inputValues);
    }
    catch (e) {
        const error = addLangChainErrorFields(e, "INVALID_PROMPT_INPUT");
        throw error;
    }
};
export const parseTemplate = (template, templateFormat) => DEFAULT_PARSER_MAPPING[templateFormat](template);
export const checkValidTemplate = (template, templateFormat, inputVariables) => {
    if (!(templateFormat in DEFAULT_FORMATTER_MAPPING)) {
        const validFormats = Object.keys(DEFAULT_FORMATTER_MAPPING);
        throw new Error(`Invalid template format. Got \`${templateFormat}\`;
                         should be one of ${validFormats}`);
    }
    try {
        const dummyInputs = inputVariables.reduce((acc, v) => {
            acc[v] = "foo";
            return acc;
        }, {});
        if (Array.isArray(template)) {
            template.forEach((message) => {
                if (message.type === "text") {
                    renderTemplate(message.text, templateFormat, dummyInputs);
                }
                else if (message.type === "image_url") {
                    if (typeof message.image_url === "string") {
                        renderTemplate(message.image_url, templateFormat, dummyInputs);
                    }
                    else {
                        const imageUrl = message.image_url.url;
                        renderTemplate(imageUrl, templateFormat, dummyInputs);
                    }
                }
                else {
                    throw new Error(`Invalid message template received. ${JSON.stringify(message, null, 2)}`);
                }
            });
        }
        else {
            renderTemplate(template, templateFormat, dummyInputs);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (e) {
        throw new Error(`Invalid prompt schema: ${e.message}`);
    }
};
