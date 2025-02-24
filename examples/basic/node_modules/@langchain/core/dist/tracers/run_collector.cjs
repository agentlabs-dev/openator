"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunCollectorCallbackHandler = void 0;
const base_js_1 = require("./base.cjs");
/**
 * A callback handler that collects traced runs and makes it easy to fetch the traced run object from calls through any langchain object.
 * For instance, it makes it easy to fetch the run ID and then do things with that, such as log feedback.
 */
class RunCollectorCallbackHandler extends base_js_1.BaseTracer {
    /**
     * Creates a new instance of the RunCollectorCallbackHandler class.
     * @param exampleId The ID of the example.
     */
    constructor({ exampleId } = {}) {
        super({ _awaitHandler: true });
        /** The name of the callback handler. */
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "run_collector"
        });
        /** The ID of the example. */
        Object.defineProperty(this, "exampleId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** An array of traced runs. */
        Object.defineProperty(this, "tracedRuns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.exampleId = exampleId;
        this.tracedRuns = [];
    }
    /**
     * Persists the given run object.
     * @param run The run object to persist.
     */
    async persistRun(run) {
        const run_ = { ...run };
        run_.reference_example_id = this.exampleId;
        this.tracedRuns.push(run_);
    }
}
exports.RunCollectorCallbackHandler = RunCollectorCallbackHandler;
