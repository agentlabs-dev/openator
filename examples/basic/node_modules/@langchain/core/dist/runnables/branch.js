import { Runnable, _coerceToDict, _coerceToRunnable, } from "./base.js";
import { getCallbackManagerForConfig, patchConfig, } from "./config.js";
import { concat } from "../utils/stream.js";
/**
 * Class that represents a runnable branch. The RunnableBranch is
 * initialized with an array of branches and a default branch. When invoked,
 * it evaluates the condition of each branch in order and executes the
 * corresponding branch if the condition is true. If none of the conditions
 * are true, it executes the default branch.
 * @example
 * ```typescript
 * const branch = RunnableBranch.from([
 *   [
 *     (x: { topic: string; question: string }) =>
 *       x.topic.toLowerCase().includes("anthropic"),
 *     anthropicChain,
 *   ],
 *   [
 *     (x: { topic: string; question: string }) =>
 *       x.topic.toLowerCase().includes("langchain"),
 *     langChainChain,
 *   ],
 *   generalChain,
 * ]);
 *
 * const fullChain = RunnableSequence.from([
 *   {
 *     topic: classificationChain,
 *     question: (input: { question: string }) => input.question,
 *   },
 *   branch,
 * ]);
 *
 * const result = await fullChain.invoke({
 *   question: "how do I use LangChain?",
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class RunnableBranch extends Runnable {
    static lc_name() {
        return "RunnableBranch";
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
        Object.defineProperty(this, "default", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "branches", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.branches = fields.branches;
        this.default = fields.default;
    }
    /**
     * Convenience method for instantiating a RunnableBranch from
     * RunnableLikes (objects, functions, or Runnables).
     *
     * Each item in the input except for the last one should be a
     * tuple with two items. The first is a "condition" RunnableLike that
     * returns "true" if the second RunnableLike in the tuple should run.
     *
     * The final item in the input should be a RunnableLike that acts as a
     * default branch if no other branches match.
     *
     * @example
     * ```ts
     * import { RunnableBranch } from "@langchain/core/runnables";
     *
     * const branch = RunnableBranch.from([
     *   [(x: number) => x > 0, (x: number) => x + 1],
     *   [(x: number) => x < 0, (x: number) => x - 1],
     *   (x: number) => x
     * ]);
     * ```
     * @param branches An array where the every item except the last is a tuple of [condition, runnable]
     *   pairs. The last item is a default runnable which is invoked if no other condition matches.
     * @returns A new RunnableBranch.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static from(branches) {
        if (branches.length < 1) {
            throw new Error("RunnableBranch requires at least one branch");
        }
        const branchLikes = branches.slice(0, -1);
        const coercedBranches = branchLikes.map(([condition, runnable]) => [
            _coerceToRunnable(condition),
            _coerceToRunnable(runnable),
        ]);
        const defaultBranch = _coerceToRunnable(branches[branches.length - 1]);
        return new this({
            branches: coercedBranches,
            default: defaultBranch,
        });
    }
    async _invoke(input, config, runManager) {
        let result;
        for (let i = 0; i < this.branches.length; i += 1) {
            const [condition, branchRunnable] = this.branches[i];
            const conditionValue = await condition.invoke(input, patchConfig(config, {
                callbacks: runManager?.getChild(`condition:${i + 1}`),
            }));
            if (conditionValue) {
                result = await branchRunnable.invoke(input, patchConfig(config, {
                    callbacks: runManager?.getChild(`branch:${i + 1}`),
                }));
                break;
            }
        }
        if (!result) {
            result = await this.default.invoke(input, patchConfig(config, {
                callbacks: runManager?.getChild("branch:default"),
            }));
        }
        return result;
    }
    async invoke(input, config = {}) {
        return this._callWithConfig(this._invoke, input, config);
    }
    async *_streamIterator(input, config) {
        const callbackManager_ = await getCallbackManagerForConfig(config);
        const runManager = await callbackManager_?.handleChainStart(this.toJSON(), _coerceToDict(input, "input"), config?.runId, undefined, undefined, undefined, config?.runName);
        let finalOutput;
        let finalOutputSupported = true;
        let stream;
        try {
            for (let i = 0; i < this.branches.length; i += 1) {
                const [condition, branchRunnable] = this.branches[i];
                const conditionValue = await condition.invoke(input, patchConfig(config, {
                    callbacks: runManager?.getChild(`condition:${i + 1}`),
                }));
                if (conditionValue) {
                    stream = await branchRunnable.stream(input, patchConfig(config, {
                        callbacks: runManager?.getChild(`branch:${i + 1}`),
                    }));
                    for await (const chunk of stream) {
                        yield chunk;
                        if (finalOutputSupported) {
                            if (finalOutput === undefined) {
                                finalOutput = chunk;
                            }
                            else {
                                try {
                                    finalOutput = concat(finalOutput, chunk);
                                }
                                catch (e) {
                                    finalOutput = undefined;
                                    finalOutputSupported = false;
                                }
                            }
                        }
                    }
                    break;
                }
            }
            if (stream === undefined) {
                stream = await this.default.stream(input, patchConfig(config, {
                    callbacks: runManager?.getChild("branch:default"),
                }));
                for await (const chunk of stream) {
                    yield chunk;
                    if (finalOutputSupported) {
                        if (finalOutput === undefined) {
                            finalOutput = chunk;
                        }
                        else {
                            try {
                                finalOutput = concat(finalOutput, chunk);
                            }
                            catch (e) {
                                finalOutput = undefined;
                                finalOutputSupported = false;
                            }
                        }
                    }
                }
            }
        }
        catch (e) {
            await runManager?.handleChainError(e);
            throw e;
        }
        await runManager?.handleChainEnd(finalOutput ?? {});
    }
}
