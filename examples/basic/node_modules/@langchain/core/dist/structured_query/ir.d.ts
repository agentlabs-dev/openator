import { VectorStore } from "../vectorstores.js";
/**
 * Represents logical AND operator.
 */
export type AND = "and";
/**
 * Represents logical OR operator.
 */
export type OR = "or";
/**
 * Represents logical NOT operator.
 */
export type NOT = "not";
/**
 * Represents a logical operator which can be AND, OR, or NOT.
 */
export type Operator = AND | OR | NOT;
/**
 * Represents equality comparison operator.
 */
export type EQ = "eq";
/**
 * Represents inequality comparison operator.
 */
export type NE = "ne";
/**
 * Represents less than comparison operator.
 */
export type LT = "lt";
/**
 * Represents greater than comparison operator.
 */
export type GT = "gt";
/**
 * Represents less than or equal to comparison operator.
 */
export type LTE = "lte";
/**
 * Represents greater than or equal to comparison operator.
 */
export type GTE = "gte";
/**
 * Represents a comparison operator which can be EQ, NE, LT, GT, LTE, or
 * GTE.
 */
export type Comparator = EQ | NE | LT | GT | LTE | GTE;
export declare const Operators: {
    [key: string]: Operator;
};
export declare const Comparators: {
    [key: string]: Comparator;
};
/**
 * Represents the result of visiting an operation or comparison
 * expression.
 */
export type VisitorResult = VisitorOperationResult | VisitorComparisonResult;
/**
 * Represents the result of visiting an operation expression.
 */
export type VisitorOperationResult = {
    [operator: string]: VisitorResult[];
};
/**
 * Represents the result of visiting a comparison expression.
 */
export type VisitorComparisonResult = {
    [attr: string]: {
        [comparator: string]: string | number | boolean;
    };
};
/**
 * Represents the result of visiting a structured query expression.
 */
export type VisitorStructuredQueryResult = {
    filter?: VisitorComparisonResult | VisitorOperationResult;
};
/**
 * Abstract class for visiting expressions. Subclasses must implement
 * visitOperation, visitComparison, and visitStructuredQuery methods.
 */
export declare abstract class Visitor<T extends VectorStore = VectorStore> {
    VisitOperationOutput: object;
    VisitComparisonOutput: object;
    VisitStructuredQueryOutput: {
        filter?: T["FilterType"];
    };
    abstract allowedOperators: Operator[];
    abstract allowedComparators: Comparator[];
    abstract visitOperation(operation: Operation): this["VisitOperationOutput"];
    abstract visitComparison(comparison: Comparison): this["VisitComparisonOutput"];
    abstract visitStructuredQuery(structuredQuery: StructuredQuery): this["VisitStructuredQueryOutput"];
}
/**
 * Abstract class representing an expression. Subclasses must implement
 * the exprName property and the accept method.
 */
export declare abstract class Expression {
    abstract exprName: "Operation" | "Comparison" | "StructuredQuery";
    accept(visitor: Visitor): object;
}
/**
 * Abstract class representing a filter directive. It extends the
 * Expression class.
 */
export declare abstract class FilterDirective extends Expression {
}
/**
 * Class representing a comparison filter directive. It extends the
 * FilterDirective class.
 */
export declare class Comparison<ValueTypes = string | number> extends FilterDirective {
    comparator: Comparator;
    attribute: string;
    value: ValueTypes;
    exprName: "Comparison";
    constructor(comparator: Comparator, attribute: string, value: ValueTypes);
}
/**
 * Class representing an operation filter directive. It extends the
 * FilterDirective class.
 */
export declare class Operation extends FilterDirective {
    operator: Operator;
    args?: FilterDirective[] | undefined;
    exprName: "Operation";
    constructor(operator: Operator, args?: FilterDirective[] | undefined);
}
/**
 * Class representing a structured query expression. It extends the
 * Expression class.
 */
export declare class StructuredQuery extends Expression {
    query: string;
    filter?: FilterDirective | undefined;
    exprName: "StructuredQuery";
    constructor(query: string, filter?: FilterDirective | undefined);
}
