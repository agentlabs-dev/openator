import { NodeHandler } from "./base.js";
import { CallExpressionType } from "./types.js";
/**
 * Handles call expressions in the AST parsed by the `ASTParser`. This
 * class is part of the LangChain Expression Language (LCEL), a
 * declarative way to compose chains together in LangChain.
 */
export declare class CallExpressionHandler extends NodeHandler {
    /**
     * Checks if a given node is a call expression. If it is, it returns the
     * node; otherwise, it returns false.
     * @param node The node to check.
     * @returns The node if it is a call expression, or false otherwise.
     */
    accepts(node: ExpressionNode): Promise<CallExpression | boolean>;
    /**
     * Processes a call expression node. It checks the type of the callee (the
     * function being called) and the arguments passed to it. If the callee is
     * an identifier, it extracts the function name. If the callee is a member
     * expression, it delegates handling to the parent handler. It also checks
     * the types of the arguments and delegates their handling to the parent
     * handler. The method returns an object representing the call expression,
     * including the function call and its arguments.
     * @param node The call expression node to process.
     * @returns An object representing the call expression, including the function call and its arguments.
     */
    handle(node: CallExpression): Promise<CallExpressionType>;
}
