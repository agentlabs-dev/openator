"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Import throws an error in internal CJS build, but seems to work fine after build
const reporters_1 = require("vitest/reporters");
const reporter_js_1 = require("../utils/jestlike/reporter.cjs");
class LangSmithEvalReporter extends reporters_1.DefaultReporter {
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
                await (0, reporter_js_1.printReporterTable)(task.name, tests, result);
            }
        }
    }
}
exports.default = LangSmithEvalReporter;
