"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangChainTracer = void 0;
const run_trees_1 = require("langsmith/run_trees");
const traceable_1 = require("langsmith/singletons/traceable");
const env_js_1 = require("../utils/env.cjs");
const base_js_1 = require("./base.cjs");
const tracer_js_1 = require("../singletons/tracer.cjs");
class LangChainTracer extends base_js_1.BaseTracer {
    constructor(fields = {}) {
        super(fields);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "langchain_tracer"
        });
        Object.defineProperty(this, "projectName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "exampleId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const { exampleId, projectName, client } = fields;
        this.projectName =
            projectName ??
                (0, env_js_1.getEnvironmentVariable)("LANGCHAIN_PROJECT") ??
                (0, env_js_1.getEnvironmentVariable)("LANGCHAIN_SESSION");
        this.exampleId = exampleId;
        this.client = client ?? (0, tracer_js_1.getDefaultLangChainClientSingleton)();
        const traceableTree = LangChainTracer.getTraceableRunTree();
        if (traceableTree) {
            this.updateFromRunTree(traceableTree);
        }
    }
    async _convertToCreate(run, example_id = undefined) {
        return {
            ...run,
            extra: {
                ...run.extra,
                runtime: await (0, env_js_1.getRuntimeEnvironment)(),
            },
            child_runs: undefined,
            session_name: this.projectName,
            reference_example_id: run.parent_run_id ? undefined : example_id,
        };
    }
    async persistRun(_run) { }
    async onRunCreate(run) {
        const persistedRun = await this._convertToCreate(run, this.exampleId);
        await this.client.createRun(persistedRun);
    }
    async onRunUpdate(run) {
        const runUpdate = {
            end_time: run.end_time,
            error: run.error,
            outputs: run.outputs,
            events: run.events,
            inputs: run.inputs,
            trace_id: run.trace_id,
            dotted_order: run.dotted_order,
            parent_run_id: run.parent_run_id,
            extra: run.extra,
        };
        await this.client.updateRun(run.id, runUpdate);
    }
    getRun(id) {
        return this.runMap.get(id);
    }
    updateFromRunTree(runTree) {
        let rootRun = runTree;
        const visited = new Set();
        while (rootRun.parent_run) {
            if (visited.has(rootRun.id))
                break;
            visited.add(rootRun.id);
            if (!rootRun.parent_run)
                break;
            rootRun = rootRun.parent_run;
        }
        visited.clear();
        const queue = [rootRun];
        while (queue.length > 0) {
            const current = queue.shift();
            if (!current || visited.has(current.id))
                continue;
            visited.add(current.id);
            // @ts-expect-error Types of property 'events' are incompatible.
            this.runMap.set(current.id, current);
            if (current.child_runs) {
                queue.push(...current.child_runs);
            }
        }
        this.client = runTree.client ?? this.client;
        this.projectName = runTree.project_name ?? this.projectName;
        this.exampleId = runTree.reference_example_id ?? this.exampleId;
    }
    convertToRunTree(id) {
        const runTreeMap = {};
        const runTreeList = [];
        for (const [id, run] of this.runMap) {
            // by converting the run map to a run tree, we are doing a copy
            // thus, any mutation performed on the run tree will not be reflected
            // back in the run map
            // TODO: Stop using `this.runMap` in favour of LangSmith's `RunTree`
            const runTree = new run_trees_1.RunTree({
                ...run,
                child_runs: [],
                parent_run: undefined,
                // inherited properties
                client: this.client,
                project_name: this.projectName,
                reference_example_id: this.exampleId,
                tracingEnabled: true,
            });
            runTreeMap[id] = runTree;
            runTreeList.push([id, run.dotted_order]);
        }
        runTreeList.sort((a, b) => {
            if (!a[1] || !b[1])
                return 0;
            return a[1].localeCompare(b[1]);
        });
        for (const [id] of runTreeList) {
            const run = this.runMap.get(id);
            const runTree = runTreeMap[id];
            if (!run || !runTree)
                continue;
            if (run.parent_run_id) {
                const parentRunTree = runTreeMap[run.parent_run_id];
                if (parentRunTree) {
                    parentRunTree.child_runs.push(runTree);
                    runTree.parent_run = parentRunTree;
                }
            }
        }
        return runTreeMap[id];
    }
    static getTraceableRunTree() {
        try {
            return (0, traceable_1.getCurrentRunTree)();
        }
        catch {
            return undefined;
        }
    }
}
exports.LangChainTracer = LangChainTracer;
