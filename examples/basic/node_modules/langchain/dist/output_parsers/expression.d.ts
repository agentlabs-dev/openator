import { BaseOutputParser } from "@langchain/core/output_parsers";
import { ParsedType } from "./expression_type_handlers/types.js";
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
export declare class ExpressionParser extends BaseOutputParser<ParsedType> {
    lc_namespace: string[];
    parser: ParseFunction;
    /**
     * We should separate loading the parser into its own function
     * because loading the grammar takes some time. If there are
     * multiple concurrent parse calls, it's faster to just wait
     * for building the parser once and then use it for all
     * subsequent calls. See expression.test.ts for an example.
     */
    ensureParser(): Promise<void>;
    /**
     * Parses the given text. It first ensures the parser is loaded, then
     * tries to parse the text. If the parsing fails, it throws an error. If
     * the parsing is successful, it returns the parsed expression.
     * @param text The text to be parsed.
     * @returns The parsed expression
     */
    parse(text: string): Promise<ParsedType>;
    /**
     * This method is currently empty, but it could be used to provide
     * instructions on the format of the input text.
     * @returns string
     */
    getFormatInstructions(): string;
}
export * from "./expression_type_handlers/types.js";
export { MasterHandler } from "./expression_type_handlers/factory.js";
