"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumericLiteralHandler = void 0;
const base_js_1 = require("./base.cjs");
/**
 * Handler for numeric literal nodes in an abstract syntax tree (AST).
 * Extends the NodeHandler class.
 */
class NumericLiteralHandler extends base_js_1.NodeHandler {
    /**
     * Checks if a given node is a numeric literal. If it is, the method
     * returns the node; otherwise, it returns false.
     * @param node The node to check.
     * @returns A Promise that resolves to the node if it is a numeric literal, or false otherwise.
     */
    async accepts(node) {
        if (base_js_1.ASTParser.isNumericLiteral(node)) {
            return node;
        }
        else {
            return false;
        }
    }
    /**
     * Processes a numeric literal node and returns a NumericLiteralType
     * object representing it.
     * @param node The numeric literal node to process.
     * @returns A Promise that resolves to a NumericLiteralType object representing the numeric literal node.
     */
    async handle(node) {
        if (!this.parentHandler) {
            throw new Error("ArrayLiteralExpressionHandler must have a parent handler");
        }
        return {
            type: "numeric_literal",
            value: Number(node.value),
        };
    }
}
exports.NumericLiteralHandler = NumericLiteralHandler;
