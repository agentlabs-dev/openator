/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Import throws an error in internal CJS build, but seems to work fine after build
import { DefaultReporter } from "vitest/reporters";
import { printReporterTable } from "../utils/jestlike/reporter.js";
class LangSmithEvalReporter extends DefaultReporter {
    async onFinished(files, errors) {
        super.onFinished(files, errors);
        for (const file of files) {
            for (const task of file.tasks) {
                const testModule = this.ctx.state.getReportedEntity(task);
                const tests = [...testModule.children.allTests()].map((test) => {
                    return {
                        title: test.name,
                        status: test.result()?.state ?? "skipped",
                        duration: Math.round(test.diagnostic()?.duration ?? 0),
                    };
                });
                const result = ["pass", "fail", "skip"].includes(task.result?.state ?? "")
                    ? task.result?.state
                    : "skip";
                await printReporterTable(task.name, tests, result);
            }
        }
    }
}
export default LangSmithEvalReporter;
