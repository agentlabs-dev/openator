"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterHandler = exports.ExpressionParser = void 0;
const output_parsers_1 = require("@langchain/core/output_parsers");
const factory_js_1 = require("./expression_type_handlers/factory.cjs");
const base_js_1 = require("./expression_type_handlers/base.cjs");
/**
 * We need to be able to handle the following cases:
 * ExpressionStatement
 *  CallExpression
 *      Identifier | MemberExpression
 *      ExpressionLiterals: [
 *          CallExpression
 *          StringLiteral
 *          NumericLiteral
 *          ArrayLiteralExpression
 *              ExpressionLiterals
 *          ObjectLiteralExpression
 *              PropertyAssignment
 *                  Identifier
 *                  ExpressionLiterals
 *      ]
 */
class ExpressionParser extends output_parsers_1.BaseOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "output_parsers", "expression"]
        });
        Object.defineProperty(this, "parser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    /**
     * We should separate loading the parser into its own function
     * because loading the grammar takes some time. If there are
     * multiple concurrent parse calls, it's faster to just wait
     * for building the parser once and then use it for all
     * subsequent calls. See expression.test.ts for an example.
     */
    async ensureParser() {
        if (!this.parser) {
            this.parser = await base_js_1.ASTParser.importASTParser();
        }
    }
    /**
     * Parses the given text. It first ensures the parser is loaded, then
     * tries to parse the text. If the parsing fails, it throws an error. If
     * the parsing is successful, it returns the parsed expression.
     * @param text The text to be parsed.
     * @returns The parsed expression
     */
    async parse(text) {
        await this.ensureParser();
        try {
            const program = this.parser(text);
            const node = program.body;
            if (!base_js_1.ASTParser.isExpressionStatement(node)) {
                throw new Error(`Expected ExpressionStatement, got ${node.type}`);
            }
            const { expression: expressionStatement } = node;
            if (!base_js_1.ASTParser.isCallExpression(expressionStatement)) {
                throw new Error("Expected CallExpression");
            }
            const masterHandler = factory_js_1.MasterHandler.createMasterHandler();
            return await masterHandler.handle(expressionStatement);
        }
        catch (err) {
            throw new Error(`Error parsing ${err}: ${text}`);
        }
    }
    /**
     * This method is currently empty, but it could be used to provide
     * instructions on the format of the input text.
     * @returns string
     */
    getFormatInstructions() {
        return "";
    }
}
exports.ExpressionParser = ExpressionParser;
__exportStar(require("./expression_type_handlers/types.cjs"), exports);
var factory_js_2 = require("./expression_type_handlers/factory.cjs");
Object.defineProperty(exports, "MasterHandler", { enumerable: true, get: function () { return factory_js_2.MasterHandler; } });
