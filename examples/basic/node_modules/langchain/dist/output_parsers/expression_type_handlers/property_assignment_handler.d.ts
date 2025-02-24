import { NodeHandler } from "./base.js";
import { PropertyAssignmentType } from "./types.js";
/**
 * Handler for `PropertyAssignment` nodes in an AST. Extends the
 * `NodeHandler` base class.
 */
export declare class PropertyAssignmentHandler extends NodeHandler {
    /**
     * Checks if a given node is a `PropertyAssignment` and returns the node
     * if true, or false otherwise.
     * @param node The node to check.
     * @returns The node if it is a `PropertyAssignment`, or false otherwise.
     */
    accepts(node: ExpressionNode): Promise<PropertyAssignment | boolean>;
    /**
     * Processes a `PropertyAssignment` node. Extracts the key and value of
     * the property assignment and returns an object of type
     * `PropertyAssignmentType` with the extracted identifier and value.
     * @param node The `PropertyAssignment` node to process.
     * @returns An object of type `PropertyAssignmentType` with the extracted identifier and value.
     */
    handle(node: PropertyAssignment): Promise<PropertyAssignmentType>;
}
