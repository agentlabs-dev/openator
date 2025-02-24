"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterHandler = void 0;
const base_js_1 = require("./base.cjs");
const array_literal_expression_handler_js_1 = require("./array_literal_expression_handler.cjs");
const boolean_literal_handler_js_1 = require("./boolean_literal_handler.cjs");
const call_expression_handler_js_1 = require("./call_expression_handler.cjs");
const numeric_literal_handler_js_1 = require("./numeric_literal_handler.cjs");
const object_literal_expression_handler_js_1 = require("./object_literal_expression_handler.cjs");
const property_assignment_handler_js_1 = require("./property_assignment_handler.cjs");
const string_literal_handler_js_1 = require("./string_literal_handler.cjs");
const identifier_handler_js_1 = require("./identifier_handler.cjs");
const member_expression_handler_js_1 = require("./member_expression_handler.cjs");
const handlers = [
    array_literal_expression_handler_js_1.ArrayLiteralExpressionHandler,
    boolean_literal_handler_js_1.BooleanLiteralHandler,
    call_expression_handler_js_1.CallExpressionHandler,
    numeric_literal_handler_js_1.NumericLiteralHandler,
    object_literal_expression_handler_js_1.ObjectLiteralExpressionHandler,
    member_expression_handler_js_1.MemberExpressionHandler,
    property_assignment_handler_js_1.PropertyAssignmentHandler,
    string_literal_handler_js_1.StringLiteralHandler,
    identifier_handler_js_1.IdentifierHandler,
];
/**
 * The MasterHandler class is responsible for managing a collection of
 * node handlers in the LangChain Expression Language. Each node handler
 * is capable of handling a specific type of node in the expression
 * language. The MasterHandler class uses these node handlers to process
 * nodes in the expression language.
 */
class MasterHandler extends base_js_1.NodeHandler {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "nodeHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    async accepts(node) {
        throw new Error(`Master handler does not accept any nodes: ${node}`);
    }
    /**
     * This method is responsible for handling a node. It iterates over the
     * collection of node handlers and uses the first handler that accepts the
     * node to handle it. If no handler accepts the node, the method throws an
     * error.
     * @param node The node to be handled.
     * @returns The result of the node handling, or throws an error if no handler can handle the node.
     */
    async handle(node) {
        for (const handler of this.nodeHandlers) {
            const accepts = await handler.accepts(node);
            if (accepts) {
                return handler.handle(node);
            }
        }
        throw new Error(`No handler found for node: ${node}`);
    }
    /**
     * This static method creates an instance of the MasterHandler class and
     * initializes it with instances of all the node handlers.
     * @returns An instance of the MasterHandler class.
     */
    static createMasterHandler() {
        const masterHandler = new MasterHandler();
        handlers.forEach((Handler) => {
            const handlerInstance = new Handler(masterHandler);
            masterHandler.nodeHandlers.push(handlerInstance);
        });
        return masterHandler;
    }
}
exports.MasterHandler = MasterHandler;
