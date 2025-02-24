"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseXMLMarkdown = exports.XMLOutputParser = exports.XML_FORMAT_INSTRUCTIONS = void 0;
const transform_js_1 = require("./transform.cjs");
const json_patch_js_1 = require("../utils/json_patch.cjs");
const sax_js_1 = require("../utils/sax-js/sax.cjs");
exports.XML_FORMAT_INSTRUCTIONS = `The output should be formatted as a XML file.
1. Output should conform to the tags below. 
2. If tags are not given, make them on your own.
3. Remember to always open and close all the tags.

As an example, for the tags ["foo", "bar", "baz"]:
1. String "<foo>\n   <bar>\n      <baz></baz>\n   </bar>\n</foo>" is a well-formatted instance of the schema. 
2. String "<foo>\n   <bar>\n   </foo>" is a badly-formatted instance.
3. String "<foo>\n   <tag>\n   </tag>\n</foo>" is a badly-formatted instance.

Here are the output tags:
\`\`\`
{tags}
\`\`\``;
class XMLOutputParser extends transform_js_1.BaseCumulativeTransformOutputParser {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "tags", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "output_parsers"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        this.tags = fields?.tags;
    }
    static lc_name() {
        return "XMLOutputParser";
    }
    _diff(prev, next) {
        if (!next) {
            return undefined;
        }
        if (!prev) {
            return [{ op: "replace", path: "", value: next }];
        }
        return (0, json_patch_js_1.compare)(prev, next);
    }
    async parsePartialResult(generations) {
        return parseXMLMarkdown(generations[0].text);
    }
    async parse(text) {
        return parseXMLMarkdown(text);
    }
    getFormatInstructions() {
        const withTags = !!(this.tags && this.tags.length > 0);
        return withTags
            ? exports.XML_FORMAT_INSTRUCTIONS.replace("{tags}", this.tags?.join(", ") ?? "")
            : exports.XML_FORMAT_INSTRUCTIONS;
    }
}
exports.XMLOutputParser = XMLOutputParser;
const strip = (text) => text
    .split("\n")
    .map((line) => line.replace(/^\s+/, ""))
    .join("\n")
    .trim();
const parseParsedResult = (input) => {
    if (Object.keys(input).length === 0) {
        return {};
    }
    const result = {};
    if (input.children.length > 0) {
        result[input.name] = input.children.map(parseParsedResult);
        return result;
    }
    else {
        result[input.name] = input.text ?? undefined;
        return result;
    }
};
function parseXMLMarkdown(s) {
    const cleanedString = strip(s);
    const parser = sax_js_1.sax.parser(true);
    let parsedResult = {};
    const elementStack = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parser.onopentag = (node) => {
        const element = {
            name: node.name,
            attributes: node.attributes,
            children: [],
            text: "",
            isSelfClosing: node.isSelfClosing,
        };
        if (elementStack.length > 0) {
            const parentElement = elementStack[elementStack.length - 1];
            parentElement.children.push(element);
        }
        else {
            parsedResult = element;
        }
        if (!node.isSelfClosing) {
            elementStack.push(element);
        }
    };
    parser.onclosetag = () => {
        if (elementStack.length > 0) {
            const lastElement = elementStack.pop();
            if (elementStack.length === 0 && lastElement) {
                parsedResult = lastElement;
            }
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parser.ontext = (text) => {
        if (elementStack.length > 0) {
            const currentElement = elementStack[elementStack.length - 1];
            currentElement.text += text;
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parser.onattribute = (attr) => {
        if (elementStack.length > 0) {
            const currentElement = elementStack[elementStack.length - 1];
            currentElement.attributes[attr.name] = attr.value;
        }
    };
    // Try to find XML string within triple backticks.
    const match = /```(xml)?(.*)```/s.exec(cleanedString);
    const xmlString = match ? match[2] : cleanedString;
    parser.write(xmlString).close();
    // Remove the XML declaration if present
    if (parsedResult && parsedResult.name === "?xml") {
        parsedResult = parsedResult.children[0];
    }
    return parseParsedResult(parsedResult);
}
exports.parseXMLMarkdown = parseXMLMarkdown;
