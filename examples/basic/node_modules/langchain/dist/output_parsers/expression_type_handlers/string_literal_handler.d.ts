import { NodeHandler } from "./base.js";
import { StringLiteralType } from "./types.js";
/**
 * Handler for string literal nodes in the LangChain Expression Language.
 * Extends the NodeHandler base class.
 */
export declare class StringLiteralHandler extends NodeHandler {
    /**
     * Checks if a given node is a string literal. If it is, the method
     * returns the node; otherwise, it returns false.
     * @param node The ExpressionNode to check.
     * @returns A Promise that resolves to the node if it is a StringLiteral, or false otherwise.
     */
    accepts(node: ExpressionNode): Promise<StringLiteral | boolean>;
    /**
     * Processes a string literal node to extract its value. Throws an error
     * if the handler does not have a parent handler.
     * @param node The StringLiteral node to process.
     * @returns A Promise that resolves to a StringLiteralType object representing the processed form of the node.
     */
    handle(node: StringLiteral): Promise<StringLiteralType>;
}
