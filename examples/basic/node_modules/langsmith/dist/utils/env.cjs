"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShas = exports.setEnvironmentVariable = exports.getLangSmithEnvironmentVariable = exports.getEnvironmentVariable = exports.getEnvironmentVariables = exports.getLangChainEnvVarsMetadata = exports.getLangChainEnvVars = exports.getRuntimeEnvironment = exports.getEnv = exports.isNode = exports.isDeno = exports.isJsDom = exports.isWebWorker = exports.isBrowser = void 0;
// Inlined from https://github.com/flexdinesh/browser-or-node
const index_js_1 = require("../index.cjs");
let globalEnv;
const isBrowser = () => typeof window !== "undefined" && typeof window.document !== "undefined";
exports.isBrowser = isBrowser;
const isWebWorker = () => typeof globalThis === "object" &&
    globalThis.constructor &&
    globalThis.constructor.name === "DedicatedWorkerGlobalScope";
exports.isWebWorker = isWebWorker;
const isJsDom = () => (typeof window !== "undefined" && window.name === "nodejs") ||
    (typeof navigator !== "undefined" &&
        (navigator.userAgent.includes("Node.js") ||
            navigator.userAgent.includes("jsdom")));
exports.isJsDom = isJsDom;
// Supabase Edge Function provides a `Deno` global object
// without `version` property
const isDeno = () => typeof Deno !== "undefined";
exports.isDeno = isDeno;
// Mark not-as-node if in Supabase Edge Function
const isNode = () => typeof process !== "undefined" &&
    typeof process.versions !== "undefined" &&
    typeof process.versions.node !== "undefined" &&
    !(0, exports.isDeno)();
exports.isNode = isNode;
const getEnv = () => {
    if (globalEnv) {
        return globalEnv;
    }
    if ((0, exports.isBrowser)()) {
        globalEnv = "browser";
    }
    else if ((0, exports.isNode)()) {
        globalEnv = "node";
    }
    else if ((0, exports.isWebWorker)()) {
        globalEnv = "webworker";
    }
    else if ((0, exports.isJsDom)()) {
        globalEnv = "jsdom";
    }
    else if ((0, exports.isDeno)()) {
        globalEnv = "deno";
    }
    else {
        globalEnv = "other";
    }
    return globalEnv;
};
exports.getEnv = getEnv;
let runtimeEnvironment;
function getRuntimeEnvironment() {
    if (runtimeEnvironment === undefined) {
        const env = (0, exports.getEnv)();
        const releaseEnv = getShas();
        runtimeEnvironment = {
            library: "langsmith",
            runtime: env,
            sdk: "langsmith-js",
            sdk_version: index_js_1.__version__,
            ...releaseEnv,
        };
    }
    return runtimeEnvironment;
}
exports.getRuntimeEnvironment = getRuntimeEnvironment;
/**
 * Retrieves the LangChain-specific environment variables from the current runtime environment.
 * Sensitive keys (containing the word "key", "token", or "secret") have their values redacted for security.
 *
 * @returns {Record<string, string>}
 *  - A record of LangChain-specific environment variables.
 */
function getLangChainEnvVars() {
    const allEnvVars = getEnvironmentVariables() || {};
    const envVars = {};
    for (const [key, value] of Object.entries(allEnvVars)) {
        if (key.startsWith("LANGCHAIN_") && typeof value === "string") {
            envVars[key] = value;
        }
    }
    for (const key in envVars) {
        if ((key.toLowerCase().includes("key") ||
            key.toLowerCase().includes("secret") ||
            key.toLowerCase().includes("token")) &&
            typeof envVars[key] === "string") {
            const value = envVars[key];
            envVars[key] =
                value.slice(0, 2) + "*".repeat(value.length - 4) + value.slice(-2);
        }
    }
    return envVars;
}
exports.getLangChainEnvVars = getLangChainEnvVars;
/**
 * Retrieves the LangChain-specific metadata from the current runtime environment.
 *
 * @returns {Record<string, string>}
 *  - A record of LangChain-specific metadata environment variables.
 */
function getLangChainEnvVarsMetadata() {
    const allEnvVars = getEnvironmentVariables() || {};
    const envVars = {};
    const excluded = [
        "LANGCHAIN_API_KEY",
        "LANGCHAIN_ENDPOINT",
        "LANGCHAIN_TRACING_V2",
        "LANGCHAIN_PROJECT",
        "LANGCHAIN_SESSION",
        "LANGSMITH_API_KEY",
        "LANGSMITH_ENDPOINT",
        "LANGSMITH_TRACING_V2",
        "LANGSMITH_PROJECT",
        "LANGSMITH_SESSION",
    ];
    for (const [key, value] of Object.entries(allEnvVars)) {
        if ((key.startsWith("LANGCHAIN_") || key.startsWith("LANGSMITH_")) &&
            typeof value === "string" &&
            !excluded.includes(key) &&
            !key.toLowerCase().includes("key") &&
            !key.toLowerCase().includes("secret") &&
            !key.toLowerCase().includes("token")) {
            if (key === "LANGCHAIN_REVISION_ID") {
                envVars["revision_id"] = value;
            }
            else {
                envVars[key] = value;
            }
        }
    }
    return envVars;
}
exports.getLangChainEnvVarsMetadata = getLangChainEnvVarsMetadata;
/**
 * Retrieves the environment variables from the current runtime environment.
 *
 * This function is designed to operate in a variety of JS environments,
 * including Node.js, Deno, browsers, etc.
 *
 * @returns {Record<string, string> | undefined}
 *  - A record of environment variables if available.
 *  - `undefined` if the environment does not support or allows access to environment variables.
 */
function getEnvironmentVariables() {
    try {
        // Check for Node.js environment
        // eslint-disable-next-line no-process-env
        if (typeof process !== "undefined" && process.env) {
            // eslint-disable-next-line no-process-env
            return Object.entries(process.env).reduce((acc, [key, value]) => {
                acc[key] = String(value);
                return acc;
            }, {});
        }
        // For browsers and other environments, we may not have direct access to env variables
        // Return undefined or any other fallback as required.
        return undefined;
    }
    catch (e) {
        // Catch any errors that might occur while trying to access environment variables
        return undefined;
    }
}
exports.getEnvironmentVariables = getEnvironmentVariables;
function getEnvironmentVariable(name) {
    // Certain Deno setups will throw an error if you try to access environment variables
    // https://github.com/hwchase17/langchainjs/issues/1412
    try {
        return typeof process !== "undefined"
            ? // eslint-disable-next-line no-process-env
                process.env?.[name]
            : undefined;
    }
    catch (e) {
        return undefined;
    }
}
exports.getEnvironmentVariable = getEnvironmentVariable;
function getLangSmithEnvironmentVariable(name) {
    return (getEnvironmentVariable(`LANGSMITH_${name}`) ||
        getEnvironmentVariable(`LANGCHAIN_${name}`));
}
exports.getLangSmithEnvironmentVariable = getLangSmithEnvironmentVariable;
function setEnvironmentVariable(name, value) {
    if (typeof process !== "undefined") {
        // eslint-disable-next-line no-process-env
        process.env[name] = value;
    }
}
exports.setEnvironmentVariable = setEnvironmentVariable;
let cachedCommitSHAs;
/**
 * Get the Git commit SHA from common environment variables
 * used by different CI/CD platforms.
 * @returns {string | undefined} The Git commit SHA or undefined if not found.
 */
function getShas() {
    if (cachedCommitSHAs !== undefined) {
        return cachedCommitSHAs;
    }
    const common_release_envs = [
        "VERCEL_GIT_COMMIT_SHA",
        "NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA",
        "COMMIT_REF",
        "RENDER_GIT_COMMIT",
        "CI_COMMIT_SHA",
        "CIRCLE_SHA1",
        "CF_PAGES_COMMIT_SHA",
        "REACT_APP_GIT_SHA",
        "SOURCE_VERSION",
        "GITHUB_SHA",
        "TRAVIS_COMMIT",
        "GIT_COMMIT",
        "BUILD_VCS_NUMBER",
        "bamboo_planRepository_revision",
        "Build.SourceVersion",
        "BITBUCKET_COMMIT",
        "DRONE_COMMIT_SHA",
        "SEMAPHORE_GIT_SHA",
        "BUILDKITE_COMMIT",
    ];
    const shas = {};
    for (const env of common_release_envs) {
        const envVar = getEnvironmentVariable(env);
        if (envVar !== undefined) {
            shas[env] = envVar;
        }
    }
    cachedCommitSHAs = shas;
    return shas;
}
exports.getShas = getShas;
