import { Runnable } from "./base.js";
import { ensureConfig } from "./config.js";
/**
 * A runnable that routes to a set of runnables based on Input['key'].
 * Returns the output of the selected runnable.
 * @example
 * ```typescript
 * import { RouterRunnable, RunnableLambda } from "@langchain/core/runnables";
 *
 * const router = new RouterRunnable({
 *   runnables: {
 *     toUpperCase: RunnableLambda.from((text: string) => text.toUpperCase()),
 *     reverseText: RunnableLambda.from((text: string) =>
 *       text.split("").reverse().join("")
 *     ),
 *   },
 * });
 *
 * // Invoke the 'reverseText' runnable
 * const result1 = router.invoke({ key: "reverseText", input: "Hello World" });
 *
 * // "dlroW olleH"
 *
 * // Invoke the 'toUpperCase' runnable
 * const result2 = router.invoke({ key: "toUpperCase", input: "Hello World" });
 *
 * // "HELLO WORLD"
 * ```
 */
export class RouterRunnable extends Runnable {
    static lc_name() {
        return "RouterRunnable";
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "runnables", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.runnables = fields.runnables;
    }
    async invoke(input, options) {
        const { key, input: actualInput } = input;
        const runnable = this.runnables[key];
        if (runnable === undefined) {
            throw new Error(`No runnable associated with key "${key}".`);
        }
        return runnable.invoke(actualInput, ensureConfig(options));
    }
    async batch(inputs, options, batchOptions) {
        const keys = inputs.map((input) => input.key);
        const actualInputs = inputs.map((input) => input.input);
        const missingKey = keys.find((key) => this.runnables[key] === undefined);
        if (missingKey !== undefined) {
            throw new Error(`One or more keys do not have a corresponding runnable.`);
        }
        const runnables = keys.map((key) => this.runnables[key]);
        const optionsList = this._getOptionsList(options ?? {}, inputs.length);
        const maxConcurrency = optionsList[0]?.maxConcurrency ?? batchOptions?.maxConcurrency;
        const batchSize = maxConcurrency && maxConcurrency > 0 ? maxConcurrency : inputs.length;
        const batchResults = [];
        for (let i = 0; i < actualInputs.length; i += batchSize) {
            const batchPromises = actualInputs
                .slice(i, i + batchSize)
                .map((actualInput, i) => runnables[i].invoke(actualInput, optionsList[i]));
            const batchResult = await Promise.all(batchPromises);
            batchResults.push(batchResult);
        }
        return batchResults.flat();
    }
    async stream(input, options) {
        const { key, input: actualInput } = input;
        const runnable = this.runnables[key];
        if (runnable === undefined) {
            throw new Error(`No runnable associated with key "${key}".`);
        }
        return runnable.stream(actualInput, options);
    }
}
