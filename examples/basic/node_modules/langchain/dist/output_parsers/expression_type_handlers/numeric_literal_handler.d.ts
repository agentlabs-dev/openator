import { NodeHandler } from "./base.js";
import { NumericLiteralType } from "./types.js";
/**
 * Handler for numeric literal nodes in an abstract syntax tree (AST).
 * Extends the NodeHandler class.
 */
export declare class NumericLiteralHandler extends NodeHandler {
    /**
     * Checks if a given node is a numeric literal. If it is, the method
     * returns the node; otherwise, it returns false.
     * @param node The node to check.
     * @returns A Promise that resolves to the node if it is a numeric literal, or false otherwise.
     */
    accepts(node: ExpressionNode): Promise<NumericLiteral | boolean>;
    /**
     * Processes a numeric literal node and returns a NumericLiteralType
     * object representing it.
     * @param node The numeric literal node to process.
     * @returns A Promise that resolves to a NumericLiteralType object representing the numeric literal node.
     */
    handle(node: NumericLiteral): Promise<NumericLiteralType>;
}
