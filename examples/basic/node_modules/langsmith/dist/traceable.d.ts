import { RunTreeConfig } from "./run_trees.js";
import { Attachments, InvocationParamsSchema, KVMap } from "./schemas.js";
import { TraceableFunction } from "./singletons/types.js";
/**
 * Higher-order function that takes function as input and returns a
 * "TraceableFunction" - a wrapped version of the input that
 * automatically handles tracing. If the returned traceable function calls any
 * traceable functions, those are automatically traced as well.
 *
 * The returned TraceableFunction can accept a run tree or run tree config as
 * its first argument. If omitted, it will default to the caller's run tree,
 * or will be treated as a root run.
 *
 * @param wrappedFunc Targeted function to be traced
 * @param config Additional metadata such as name, tags or providing
 *     a custom LangSmith client instance
 */
export declare function traceable<Func extends (...args: any[]) => any>(wrappedFunc: Func, config?: Partial<RunTreeConfig> & {
    aggregator?: (args: any[]) => any;
    argsConfigPath?: [number] | [number, string];
    __finalTracedIteratorKey?: string;
    /**
     * Extract attachments from args and return remaining args.
     * @param args Arguments of the traced function
     * @returns Tuple of [Attachments, remaining args]
     */
    extractAttachments?: (...args: Parameters<Func>) => [Attachments | undefined, KVMap];
    /**
     * Extract invocation parameters from the arguments of the traced function.
     * This is useful for LangSmith to properly track common metadata like
     * provider, model name and temperature.
     *
     * @param args Arguments of the traced function
     * @returns Key-value map of the invocation parameters, which will be merged with the existing metadata
     */
    getInvocationParams?: (...args: Parameters<Func>) => InvocationParamsSchema | undefined;
    /**
     * Apply transformations to the inputs before logging.
     * This function should NOT mutate the inputs.
     * `processInputs` is not inherited by nested traceable functions.
     *
     * @param inputs Key-value map of the function inputs.
     * @returns Transformed key-value map
     */
    processInputs?: (inputs: Readonly<KVMap>) => KVMap;
    /**
     * Apply transformations to the outputs before logging.
     * This function should NOT mutate the outputs.
     * `processOutputs` is not inherited by nested traceable functions.
     *
     * @param outputs Key-value map of the function outputs
     * @returns Transformed key-value map
     */
    processOutputs?: (outputs: Readonly<KVMap>) => KVMap;
}): TraceableFunction<Func>;
export { getCurrentRunTree, isTraceableFunction, withRunTree, ROOT, } from "./singletons/traceable.js";
export type { RunTreeLike, TraceableFunction } from "./singletons/types.js";
