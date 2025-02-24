"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredQuery = exports.Operation = exports.Comparison = exports.FilterDirective = exports.Expression = exports.Visitor = exports.Comparators = exports.Operators = void 0;
exports.Operators = {
    and: "and",
    or: "or",
    not: "not",
};
exports.Comparators = {
    eq: "eq",
    ne: "ne",
    lt: "lt",
    gt: "gt",
    lte: "lte",
    gte: "gte",
};
/**
 * Abstract class for visiting expressions. Subclasses must implement
 * visitOperation, visitComparison, and visitStructuredQuery methods.
 */
class Visitor {
}
exports.Visitor = Visitor;
/**
 * Abstract class representing an expression. Subclasses must implement
 * the exprName property and the accept method.
 */
class Expression {
    accept(visitor) {
        if (this.exprName === "Operation") {
            return visitor.visitOperation(this);
        }
        else if (this.exprName === "Comparison") {
            return visitor.visitComparison(this);
        }
        else if (this.exprName === "StructuredQuery") {
            return visitor.visitStructuredQuery(this);
        }
        else {
            throw new Error("Unknown Expression type");
        }
    }
}
exports.Expression = Expression;
/**
 * Abstract class representing a filter directive. It extends the
 * Expression class.
 */
class FilterDirective extends Expression {
}
exports.FilterDirective = FilterDirective;
/**
 * Class representing a comparison filter directive. It extends the
 * FilterDirective class.
 */
class Comparison extends FilterDirective {
    constructor(comparator, attribute, value) {
        super();
        Object.defineProperty(this, "comparator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: comparator
        });
        Object.defineProperty(this, "attribute", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: attribute
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: value
        });
        Object.defineProperty(this, "exprName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Comparison"
        });
    }
}
exports.Comparison = Comparison;
/**
 * Class representing an operation filter directive. It extends the
 * FilterDirective class.
 */
class Operation extends FilterDirective {
    constructor(operator, args) {
        super();
        Object.defineProperty(this, "operator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: operator
        });
        Object.defineProperty(this, "args", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: args
        });
        Object.defineProperty(this, "exprName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Operation"
        });
    }
}
exports.Operation = Operation;
/**
 * Class representing a structured query expression. It extends the
 * Expression class.
 */
class StructuredQuery extends Expression {
    constructor(query, filter) {
        super();
        Object.defineProperty(this, "query", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: query
        });
        Object.defineProperty(this, "filter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: filter
        });
        Object.defineProperty(this, "exprName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "StructuredQuery"
        });
    }
}
exports.StructuredQuery = StructuredQuery;
