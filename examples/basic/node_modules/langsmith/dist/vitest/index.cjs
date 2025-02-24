"use strict";
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-namespace */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapEvaluator = exports.logOutputs = exports.logFeedback = exports.expect = exports.describe = exports.it = exports.test = void 0;
const vitest_1 = require("vitest");
const matchers_js_1 = require("../utils/jestlike/matchers.cjs");
const evaluatedBy_js_1 = require("../utils/jestlike/vendor/evaluatedBy.cjs");
Object.defineProperty(exports, "wrapEvaluator", { enumerable: true, get: function () { return evaluatedBy_js_1.wrapEvaluator; } });
const index_js_1 = require("../utils/jestlike/index.cjs");
Object.defineProperty(exports, "logFeedback", { enumerable: true, get: function () { return index_js_1.logFeedback; } });
Object.defineProperty(exports, "logOutputs", { enumerable: true, get: function () { return index_js_1.logOutputs; } });
const index_js_2 = require("../utils/jestlike/index.cjs");
vitest_1.expect.extend({
    toBeRelativeCloseTo: matchers_js_1.toBeRelativeCloseTo,
    toBeAbsoluteCloseTo: matchers_js_1.toBeAbsoluteCloseTo,
    toBeSemanticCloseTo: matchers_js_1.toBeSemanticCloseTo,
});
const { test, it, describe, expect } = (0, index_js_2.generateWrapperFromJestlikeMethods)({
    expect: vitest_1.expect,
    test: vitest_1.test,
    describe: vitest_1.describe,
    beforeAll: vitest_1.beforeAll,
    afterAll: vitest_1.afterAll,
}, "vitest");
exports.test = test;
exports.it = it;
exports.describe = describe;
exports.expect = expect;
__exportStar(require("../utils/jestlike/types.cjs"), exports);
