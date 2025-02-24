"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._getFetchImplementation = exports.overrideFetchImplementation = void 0;
// Wrap the default fetch call due to issues with illegal invocations
// in some environments:
// https://stackoverflow.com/questions/69876859/why-does-bind-fix-failed-to-execute-fetch-on-window-illegal-invocation-err
// @ts-expect-error Broad typing to support a range of fetch implementations
const DEFAULT_FETCH_IMPLEMENTATION = (...args) => fetch(...args);
const LANGSMITH_FETCH_IMPLEMENTATION_KEY = Symbol.for("ls:fetch_implementation");
/**
 * Overrides the fetch implementation used for LangSmith calls.
 * You should use this if you need to use an implementation of fetch
 * other than the default global (e.g. for dealing with proxies).
 * @param fetch The new fetch functino to use.
 */
const overrideFetchImplementation = (fetch) => {
    globalThis[LANGSMITH_FETCH_IMPLEMENTATION_KEY] = fetch;
};
exports.overrideFetchImplementation = overrideFetchImplementation;
/**
 * @internal
 */
const _getFetchImplementation = () => {
    return (globalThis[LANGSMITH_FETCH_IMPLEMENTATION_KEY] ??
        DEFAULT_FETCH_IMPLEMENTATION);
};
exports._getFetchImplementation = _getFetchImplementation;
