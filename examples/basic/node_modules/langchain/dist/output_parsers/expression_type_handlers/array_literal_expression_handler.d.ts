import { NodeHandler } from "./base.js";
import { ArrayLiteralType } from "./types.js";
/**
 * Handles array expressions in the LangChain Expression Language (LCEL).
 * It extends the NodeHandler base class, providing functionality to
 * accept and handle array expressions.
 */
export declare class ArrayLiteralExpressionHandler extends NodeHandler {
    /**
     * Checks if the given node is an array expression. If it is, the method
     * returns the node; otherwise, it returns false.
     * @param node The ExpressionNode to check.
     * @returns A Promise that resolves to either the ArrayExpression node if the node is an array expression, or false otherwise.
     */
    accepts(node: ExpressionNode): Promise<ArrayExpression | boolean>;
    /**
     * Handles the given array expression node. If the handler doesn't have a
     * parent handler, it throws an error. Otherwise, it returns an object
     * representing the array literal.
     * @param node The ArrayExpression node to handle.
     * @returns A Promise that resolves to an object representing the array literal.
     */
    handle(node: ArrayExpression): Promise<ArrayLiteralType>;
}
