"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadQueryConstructorRunnable = exports.formatAttributeInfo = exports.StructuredQueryOutputParser = exports.EXAMPLE_PROMPT = exports.DEFAULT_SUFFIX = exports.DEFAULT_SCHEMA = exports.DEFAULT_PREFIX = exports.DEFAULT_EXAMPLES = exports.QueryTransformer = exports.AttributeInfo = void 0;
const zod_1 = require("zod");
const prompts_1 = require("@langchain/core/prompts");
const parser_js_1 = require("./parser.cjs");
Object.defineProperty(exports, "QueryTransformer", { enumerable: true, get: function () { return parser_js_1.QueryTransformer; } });
const ir_js_1 = require("./ir.cjs");
const prompt_js_1 = require("./prompt.cjs");
Object.defineProperty(exports, "DEFAULT_EXAMPLES", { enumerable: true, get: function () { return prompt_js_1.DEFAULT_EXAMPLES; } });
Object.defineProperty(exports, "DEFAULT_PREFIX", { enumerable: true, get: function () { return prompt_js_1.DEFAULT_PREFIX; } });
Object.defineProperty(exports, "DEFAULT_SCHEMA", { enumerable: true, get: function () { return prompt_js_1.DEFAULT_SCHEMA; } });
Object.defineProperty(exports, "DEFAULT_SUFFIX", { enumerable: true, get: function () { return prompt_js_1.DEFAULT_SUFFIX; } });
Object.defineProperty(exports, "EXAMPLE_PROMPT", { enumerable: true, get: function () { return prompt_js_1.EXAMPLE_PROMPT; } });
const structured_js_1 = require("../../output_parsers/structured.cjs");
/**
 * A simple data structure that holds information about an attribute. It
 * is typically used to provide metadata about attributes in other classes
 * or data structures within the LangChain framework.
 */
class AttributeInfo {
    constructor(name, type, description) {
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: name
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: type
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
    }
}
exports.AttributeInfo = AttributeInfo;
const queryInputSchema = /* #__PURE__ */ zod_1.z.object({
    query: /* #__PURE__ */ zod_1.z
        .string()
        .describe("text string to compare to document contents"),
    filter: /* #__PURE__ */ zod_1.z
        .string()
        .optional()
        .describe("logical condition statement for filtering documents"),
});
/**
 * A class that extends AsymmetricStructuredOutputParser to parse
 * structured query output.
 */
class StructuredQueryOutputParser extends structured_js_1.AsymmetricStructuredOutputParser {
    constructor(fields) {
        super({ ...fields, inputSchema: queryInputSchema });
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "chains", "query_constructor"]
        });
        Object.defineProperty(this, "queryTransformer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const { allowedComparators, allowedOperators } = fields;
        this.queryTransformer = new parser_js_1.QueryTransformer(allowedComparators, allowedOperators);
    }
    /**
     * Processes the output of a structured query.
     * @param query The query string.
     * @param filter The filter condition.
     * @returns A Promise that resolves to a StructuredQuery instance.
     */
    async outputProcessor({ query, filter, }) {
        let myQuery = query;
        if (myQuery.length === 0) {
            myQuery = " ";
        }
        if (filter === "NO_FILTER" || filter === undefined) {
            return new ir_js_1.StructuredQuery(query);
        }
        else {
            const parsedFilter = await this.queryTransformer.parse(filter);
            return new ir_js_1.StructuredQuery(query, parsedFilter);
        }
    }
    /**
     * Creates a new StructuredQueryOutputParser instance from the provided
     * components.
     * @param allowedComparators An array of allowed Comparator instances.
     * @param allowedOperators An array of allowed Operator instances.
     * @returns A new StructuredQueryOutputParser instance.
     */
    static fromComponents(allowedComparators = [], allowedOperators = []) {
        return new StructuredQueryOutputParser({
            allowedComparators,
            allowedOperators,
        });
    }
}
exports.StructuredQueryOutputParser = StructuredQueryOutputParser;
function formatAttributeInfo(info) {
    const infoObj = info.reduce((acc, attr) => {
        acc[attr.name] = {
            type: attr.type,
            description: attr.description,
        };
        return acc;
    }, {});
    return JSON.stringify(infoObj, null, 2)
        .replaceAll("{", "{{")
        .replaceAll("}", "}}");
}
exports.formatAttributeInfo = formatAttributeInfo;
const defaultExample = prompt_js_1.DEFAULT_EXAMPLES.map((EXAMPLE) => EXAMPLE);
function _getPrompt(documentContents, attributeInfo, allowedComparators, allowedOperators, examples = defaultExample) {
    const myAllowedComparators = allowedComparators ?? Object.values(ir_js_1.Comparators);
    const myAllowedOperators = allowedOperators ?? Object.values(ir_js_1.Operators);
    const attributeJSON = formatAttributeInfo(attributeInfo);
    const schema = (0, prompts_1.interpolateFString)(prompt_js_1.DEFAULT_SCHEMA, {
        allowed_comparators: myAllowedComparators.join(" | "),
        allowed_operators: myAllowedOperators.join(" | "),
    });
    const prefix = (0, prompts_1.interpolateFString)(prompt_js_1.DEFAULT_PREFIX, {
        schema,
    });
    const suffix = (0, prompts_1.interpolateFString)(prompt_js_1.DEFAULT_SUFFIX, {
        i: examples.length + 1,
        content: documentContents,
        attributes: attributeJSON,
    });
    const outputParser = StructuredQueryOutputParser.fromComponents(allowedComparators, allowedOperators);
    return new prompts_1.FewShotPromptTemplate({
        examples,
        examplePrompt: prompt_js_1.EXAMPLE_PROMPT,
        inputVariables: ["query"],
        suffix,
        prefix,
        outputParser,
    });
}
function loadQueryConstructorRunnable(opts) {
    const prompt = _getPrompt(opts.documentContents, opts.attributeInfo, opts.allowedComparators, opts.allowedOperators, opts.examples);
    const outputParser = StructuredQueryOutputParser.fromComponents(opts.allowedComparators, opts.allowedOperators);
    return prompt.pipe(opts.llm).pipe(outputParser);
}
exports.loadQueryConstructorRunnable = loadQueryConstructorRunnable;
