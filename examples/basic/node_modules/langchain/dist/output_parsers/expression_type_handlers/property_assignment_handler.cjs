"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyAssignmentHandler = void 0;
const base_js_1 = require("./base.cjs");
/**
 * Handler for `PropertyAssignment` nodes in an AST. Extends the
 * `NodeHandler` base class.
 */
class PropertyAssignmentHandler extends base_js_1.NodeHandler {
    /**
     * Checks if a given node is a `PropertyAssignment` and returns the node
     * if true, or false otherwise.
     * @param node The node to check.
     * @returns The node if it is a `PropertyAssignment`, or false otherwise.
     */
    async accepts(node) {
        if (base_js_1.ASTParser.isPropertyAssignment(node)) {
            return node;
        }
        else {
            return false;
        }
    }
    /**
     * Processes a `PropertyAssignment` node. Extracts the key and value of
     * the property assignment and returns an object of type
     * `PropertyAssignmentType` with the extracted identifier and value.
     * @param node The `PropertyAssignment` node to process.
     * @returns An object of type `PropertyAssignmentType` with the extracted identifier and value.
     */
    async handle(node) {
        if (!this.parentHandler) {
            throw new Error("ArrayLiteralExpressionHandler must have a parent handler");
        }
        let name;
        if (base_js_1.ASTParser.isIdentifier(node.key)) {
            name = node.key.name;
        }
        else if (base_js_1.ASTParser.isStringLiteral(node.key)) {
            name = node.key.value;
        }
        else {
            throw new Error("Invalid property key type");
        }
        if (!name) {
            throw new Error("Invalid property key");
        }
        const identifier = `${name}`.replace(/^["'](.+(?=["']$))["']$/, "$1");
        const value = await this.parentHandler.handle(node.value);
        return { type: "property_assignment", identifier, value };
    }
}
exports.PropertyAssignmentHandler = PropertyAssignmentHandler;
