"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFunctionDefinitions = void 0;
function isAnyOfProp(prop) {
    return (prop.anyOf !== undefined &&
        Array.isArray(prop.anyOf));
}
// When OpenAI use functions in the prompt, they format them as TypeScript definitions rather than OpenAPI JSON schemas.
// This function converts the JSON schemas into TypeScript definitions.
function formatFunctionDefinitions(functions) {
    const lines = ["namespace functions {", ""];
    for (const f of functions) {
        if (f.description) {
            lines.push(`// ${f.description}`);
        }
        if (Object.keys(f.parameters.properties ?? {}).length > 0) {
            lines.push(`type ${f.name} = (_: {`);
            lines.push(formatObjectProperties(f.parameters, 0));
            lines.push("}) => any;");
        }
        else {
            lines.push(`type ${f.name} = () => any;`);
        }
        lines.push("");
    }
    lines.push("} // namespace functions");
    return lines.join("\n");
}
exports.formatFunctionDefinitions = formatFunctionDefinitions;
// Format just the properties of an object (not including the surrounding braces)
function formatObjectProperties(obj, indent) {
    const lines = [];
    for (const [name, param] of Object.entries(obj.properties ?? {})) {
        if (param.description && indent < 2) {
            lines.push(`// ${param.description}`);
        }
        if (obj.required?.includes(name)) {
            lines.push(`${name}: ${formatType(param, indent)},`);
        }
        else {
            lines.push(`${name}?: ${formatType(param, indent)},`);
        }
    }
    return lines.map((line) => " ".repeat(indent) + line).join("\n");
}
// Format a single property type
function formatType(param, indent) {
    if (isAnyOfProp(param)) {
        return param.anyOf.map((v) => formatType(v, indent)).join(" | ");
    }
    switch (param.type) {
        case "string":
            if (param.enum) {
                return param.enum.map((v) => `"${v}"`).join(" | ");
            }
            return "string";
        case "number":
            if (param.enum) {
                return param.enum.map((v) => `${v}`).join(" | ");
            }
            return "number";
        case "integer":
            if (param.enum) {
                return param.enum.map((v) => `${v}`).join(" | ");
            }
            return "number";
        case "boolean":
            return "boolean";
        case "null":
            return "null";
        case "object":
            return ["{", formatObjectProperties(param, indent + 2), "}"].join("\n");
        case "array":
            if (param.items) {
                return `${formatType(param.items, indent)}[]`;
            }
            return "any[]";
        default:
            return "";
    }
}
