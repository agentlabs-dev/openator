import { BaseRun, Run } from "langsmith/schemas";
import { BaseTracer } from "./base.js";
/**
 * A callback handler that collects traced runs and makes it easy to fetch the traced run object from calls through any langchain object.
 * For instance, it makes it easy to fetch the run ID and then do things with that, such as log feedback.
 */
export declare class RunCollectorCallbackHandler extends BaseTracer {
    /** The name of the callback handler. */
    name: string;
    /** The ID of the example. */
    exampleId?: string;
    /** An array of traced runs. */
    tracedRuns: Run[];
    /**
     * Creates a new instance of the RunCollectorCallbackHandler class.
     * @param exampleId The ID of the example.
     */
    constructor({ exampleId }?: {
        exampleId?: string;
    });
    /**
     * Persists the given run object.
     * @param run The run object to persist.
     */
    protected persistRun(run: BaseRun): Promise<void>;
}
