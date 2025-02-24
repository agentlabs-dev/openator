import { NodeHandler } from "./base.js";
import { MemberExpressionType } from "./types.js";
/**
 * Handles member expressions in the LangChain Expression Language (LCEL).
 * Extends the NodeHandler base class.
 */
export declare class MemberExpressionHandler extends NodeHandler {
    /**
     * Checks if a given node is a member expression. If it is, the method
     * returns the node; otherwise, it returns false.
     * @param node The node to check.
     * @returns The node if it is a member expression, or false otherwise.
     */
    accepts(node: ExpressionNode): Promise<MemberExpression | boolean>;
    /**
     * Processes a member expression node. It extracts the object and property
     * from the node, validates their types, and returns an object with the
     * type of the expression, the identifier, and the property.
     * @param node The member expression node to process.
     * @returns An object with the type of the expression, the identifier, and the property.
     */
    handle(node: MemberExpression): Promise<MemberExpressionType>;
}
