import { BaseChain } from "./base.js";
/**
 * Class that represents a transform chain. It extends the `BaseChain`
 * class and implements the `TransformChainFields` interface. It provides
 * a way to transform input values to output values using a specified
 * transform function.
 *
 * @deprecated
 * Switch to {@link https://js.langchain.com/docs/expression_language/ | expression language}.
 * Will be removed in 0.2.0
 */
export class TransformChain extends BaseChain {
    static lc_name() {
        return "TransformChain";
    }
    _chainType() {
        return "transform";
    }
    get inputKeys() {
        return this.inputVariables;
    }
    get outputKeys() {
        return this.outputVariables;
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "transformFunc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "inputVariables", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "outputVariables", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.transformFunc = fields.transform;
        this.inputVariables = fields.inputVariables;
        this.outputVariables = fields.outputVariables;
    }
    async _call(values, runManager) {
        return this.transformFunc(values, runManager?.getChild("transform"));
    }
}
