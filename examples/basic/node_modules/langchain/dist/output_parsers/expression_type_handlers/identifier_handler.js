import { NodeHandler, ASTParser } from "./base.js";
/**
 * Handles identifiers in the LangChain Expression Language. Extends the
 * NodeHandler class.
 */
export class IdentifierHandler extends NodeHandler {
    /**
     * Checks if a given node is an identifier. If it is, it returns the node;
     * otherwise, it returns false.
     * @param node The node to check.
     * @returns The node if it is an identifier, or false otherwise.
     */
    async accepts(node) {
        if (ASTParser.isIdentifier(node)) {
            return node;
        }
        else {
            return false;
        }
    }
    /**
     * Processes the identifier node. If the handler does not have a parent
     * handler, it throws an error. Otherwise, it extracts the name of the
     * identifier, removes any enclosing quotes, and returns an object of type
     * IdentifierType with the type set to "identifier" and the value set to
     * the extracted name.
     * @param node The identifier node to process.
     * @returns An object of type IdentifierType with the type set to "identifier" and the value set to the extracted name.
     */
    async handle(node) {
        if (!this.parentHandler) {
            throw new Error("ArrayLiteralExpressionHandler must have a parent handler");
        }
        const text = node.name.replace(/^["'](.+(?=["']$))["']$/, "$1");
        return { type: "identifier", value: text };
    }
}
