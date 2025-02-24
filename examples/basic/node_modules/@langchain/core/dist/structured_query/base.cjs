"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicTranslator = exports.BaseTranslator = void 0;
const ir_js_1 = require("./ir.cjs");
const utils_js_1 = require("./utils.cjs");
/**
 * Abstract class that provides a blueprint for creating specific
 * translator classes. Defines two abstract methods: formatFunction and
 * mergeFilters.
 */
class BaseTranslator extends ir_js_1.Visitor {
}
exports.BaseTranslator = BaseTranslator;
/**
 * Class that extends the BaseTranslator class and provides concrete
 * implementations for the abstract methods. Also declares three types:
 * VisitOperationOutput, VisitComparisonOutput, and
 * VisitStructuredQueryOutput, which are used as the return types for the
 * visitOperation, visitComparison, and visitStructuredQuery methods
 * respectively.
 */
class BasicTranslator extends BaseTranslator {
    constructor(opts) {
        super();
        Object.defineProperty(this, "allowedOperators", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "allowedComparators", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.allowedOperators = opts?.allowedOperators ?? [
            ir_js_1.Operators.and,
            ir_js_1.Operators.or,
        ];
        this.allowedComparators = opts?.allowedComparators ?? [
            ir_js_1.Comparators.eq,
            ir_js_1.Comparators.ne,
            ir_js_1.Comparators.gt,
            ir_js_1.Comparators.gte,
            ir_js_1.Comparators.lt,
            ir_js_1.Comparators.lte,
        ];
    }
    formatFunction(func) {
        if (func in ir_js_1.Comparators) {
            if (this.allowedComparators.length > 0 &&
                this.allowedComparators.indexOf(func) === -1) {
                throw new Error(`Comparator ${func} not allowed. Allowed comparators: ${this.allowedComparators.join(", ")}`);
            }
        }
        else if (func in ir_js_1.Operators) {
            if (this.allowedOperators.length > 0 &&
                this.allowedOperators.indexOf(func) === -1) {
                throw new Error(`Operator ${func} not allowed. Allowed operators: ${this.allowedOperators.join(", ")}`);
            }
        }
        else {
            throw new Error("Unknown comparator or operator");
        }
        return `$${func}`;
    }
    /**
     * Visits an operation and returns a result.
     * @param operation The operation to visit.
     * @returns The result of visiting the operation.
     */
    visitOperation(operation) {
        const args = operation.args?.map((arg) => arg.accept(this));
        return {
            [this.formatFunction(operation.operator)]: args,
        };
    }
    /**
     * Visits a comparison and returns a result.
     * @param comparison The comparison to visit.
     * @returns The result of visiting the comparison.
     */
    visitComparison(comparison) {
        return {
            [comparison.attribute]: {
                [this.formatFunction(comparison.comparator)]: (0, utils_js_1.castValue)(comparison.value),
            },
        };
    }
    /**
     * Visits a structured query and returns a result.
     * @param query The structured query to visit.
     * @returns The result of visiting the structured query.
     */
    visitStructuredQuery(query) {
        let nextArg = {};
        if (query.filter) {
            nextArg = {
                filter: query.filter.accept(this),
            };
        }
        return nextArg;
    }
    mergeFilters(defaultFilter, generatedFilter, mergeType = "and", forceDefaultFilter = false) {
        if ((0, utils_js_1.isFilterEmpty)(defaultFilter) && (0, utils_js_1.isFilterEmpty)(generatedFilter)) {
            return undefined;
        }
        if ((0, utils_js_1.isFilterEmpty)(defaultFilter) || mergeType === "replace") {
            if ((0, utils_js_1.isFilterEmpty)(generatedFilter)) {
                return undefined;
            }
            return generatedFilter;
        }
        if ((0, utils_js_1.isFilterEmpty)(generatedFilter)) {
            if (forceDefaultFilter) {
                return defaultFilter;
            }
            if (mergeType === "and") {
                return undefined;
            }
            return defaultFilter;
        }
        if (mergeType === "and") {
            return {
                $and: [defaultFilter, generatedFilter],
            };
        }
        else if (mergeType === "or") {
            return {
                $or: [defaultFilter, generatedFilter],
            };
        }
        else {
            throw new Error("Unknown merge type");
        }
    }
}
exports.BasicTranslator = BasicTranslator;
