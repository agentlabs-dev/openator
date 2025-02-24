import { getCurrentRunTree, ROOT, traceable } from "../../../traceable.js";
import { testWrapperAsyncLocalStorageInstance, _logTestFeedback, trackingEnabled, } from "../globals.js";
import { v4 } from "uuid";
function isEvaluationResult(x) {
    return (x != null &&
        typeof x === "object" &&
        "key" in x &&
        typeof x.key === "string" &&
        "score" in x);
}
export function wrapEvaluator(evaluator) {
    return async (input, config) => {
        const context = testWrapperAsyncLocalStorageInstance.getStore();
        if (context === undefined || context.currentExample === undefined) {
            throw new Error([
                `Could not identify current LangSmith context.`,
                `Please ensure you are calling this matcher within "ls.test()"`,
                `See this page for more information: https://docs.smith.langchain.com/evaluation/how_to_guides/vitest_jest`,
            ].join("\n"));
        }
        const evalRunId = config?.runId ?? config?.id ?? v4();
        let evalResult;
        let currentRunTree;
        if (trackingEnabled(context)) {
            currentRunTree = getCurrentRunTree();
            const wrappedEvaluator = traceable(async (_runTree, params) => {
                return evaluator(params);
            }, {
                id: evalRunId,
                trace_id: evalRunId,
                reference_example_id: context.currentExample.id,
                client: context.client,
                tracingEnabled: true,
                name: evaluator.name ?? "<evaluator>",
                project_name: "evaluators",
                ...config,
            });
            evalResult = await wrappedEvaluator(ROOT, input);
        }
        else {
            evalResult = await evaluator(input);
        }
        let normalizedResult;
        if (!Array.isArray(evalResult)) {
            normalizedResult = [evalResult];
        }
        else {
            normalizedResult = evalResult;
        }
        for (const result of normalizedResult) {
            if (isEvaluationResult(result)) {
                _logTestFeedback({
                    exampleId: context?.currentExample?.id,
                    feedback: result,
                    context,
                    runTree: currentRunTree,
                    client: context.client,
                    sourceRunId: evalRunId,
                });
            }
        }
        return evalResult;
    };
}
export async function evaluatedBy(outputs, evaluator) {
    const context = testWrapperAsyncLocalStorageInstance.getStore();
    if (context === undefined || context.currentExample === undefined) {
        throw new Error([
            `Could not identify current LangSmith context.`,
            `Please ensure you are calling this matcher within "ls.test()"`,
            `See this page for more information: https://docs.smith.langchain.com/evaluation/how_to_guides/vitest_jest`,
        ].join("\n"));
    }
    const wrappedEvaluator = wrapEvaluator(evaluator);
    const evalRunId = v4();
    const evalResult = await wrappedEvaluator({
        inputs: context.currentExample?.inputs ?? {},
        referenceOutputs: context?.currentExample?.outputs ?? {},
        outputs,
    }, { runId: evalRunId });
    if (Array.isArray(evalResult)) {
        return evalResult.map((result) => result.score);
    }
    return evalResult.score;
}
