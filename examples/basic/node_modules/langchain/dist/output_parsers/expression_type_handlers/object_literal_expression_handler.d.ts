import { NodeHandler } from "./base.js";
import { ObjectLiteralType } from "./types.js";
/**
 * Handles object literal expressions in the LangChain Expression
 * Language. Extends the NodeHandler class.
 */
export declare class ObjectLiteralExpressionHandler extends NodeHandler {
    /**
     * Checks if a given node is an object expression. Returns the node if it
     * is, otherwise returns false.
     * @param node The node to check.
     * @returns The node if it is an object expression, otherwise false.
     */
    accepts(node: ExpressionNode): Promise<ObjectExpression | boolean>;
    /**
     * Processes the object expression node and returns an object of type
     * ObjectLiteralType. Throws an error if the parent handler is not set.
     * @param node The object expression node to process.
     * @returns An object of type ObjectLiteralType.
     */
    handle(node: ObjectExpression): Promise<ObjectLiteralType>;
}
