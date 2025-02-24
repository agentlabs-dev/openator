"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringLiteralHandler = void 0;
const base_js_1 = require("./base.cjs");
/**
 * Handler for string literal nodes in the LangChain Expression Language.
 * Extends the NodeHandler base class.
 */
class StringLiteralHandler extends base_js_1.NodeHandler {
    /**
     * Checks if a given node is a string literal. If it is, the method
     * returns the node; otherwise, it returns false.
     * @param node The ExpressionNode to check.
     * @returns A Promise that resolves to the node if it is a StringLiteral, or false otherwise.
     */
    async accepts(node) {
        if (base_js_1.ASTParser.isStringLiteral(node)) {
            return node;
        }
        else {
            return false;
        }
    }
    /**
     * Processes a string literal node to extract its value. Throws an error
     * if the handler does not have a parent handler.
     * @param node The StringLiteral node to process.
     * @returns A Promise that resolves to a StringLiteralType object representing the processed form of the node.
     */
    async handle(node) {
        if (!this.parentHandler) {
            throw new Error("ArrayLiteralExpressionHandler must have a parent handler");
        }
        const text = `${node.value}`.replace(/^["'](.+(?=["']$))["']$/, "$1");
        return { type: "string_literal", value: text };
    }
}
exports.StringLiteralHandler = StringLiteralHandler;
