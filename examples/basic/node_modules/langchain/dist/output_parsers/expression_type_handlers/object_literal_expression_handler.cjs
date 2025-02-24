"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectLiteralExpressionHandler = void 0;
const base_js_1 = require("./base.cjs");
const property_assignment_handler_js_1 = require("./property_assignment_handler.cjs");
/**
 * Handles object literal expressions in the LangChain Expression
 * Language. Extends the NodeHandler class.
 */
class ObjectLiteralExpressionHandler extends base_js_1.NodeHandler {
    /**
     * Checks if a given node is an object expression. Returns the node if it
     * is, otherwise returns false.
     * @param node The node to check.
     * @returns The node if it is an object expression, otherwise false.
     */
    async accepts(node) {
        if (base_js_1.ASTParser.isObjectExpression(node)) {
            return node;
        }
        else {
            return false;
        }
    }
    /**
     * Processes the object expression node and returns an object of type
     * ObjectLiteralType. Throws an error if the parent handler is not set.
     * @param node The object expression node to process.
     * @returns An object of type ObjectLiteralType.
     */
    async handle(node) {
        if (!this.parentHandler) {
            throw new Error("ArrayLiteralExpressionHandler must have a parent handler");
        }
        const values = [];
        const { properties } = node;
        for (const property of properties) {
            if (base_js_1.ASTParser.isPropertyAssignment(property)) {
                values.push(await new property_assignment_handler_js_1.PropertyAssignmentHandler(this.parentHandler).handle(property));
            }
        }
        return { type: "object_literal", values };
    }
}
exports.ObjectLiteralExpressionHandler = ObjectLiteralExpressionHandler;
