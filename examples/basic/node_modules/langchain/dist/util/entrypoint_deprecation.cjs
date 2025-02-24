"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logVersion020MigrationWarning = exports.logVersion010MigrationWarning = void 0;
const env_js_1 = require("./env.cjs");
function logVersion010MigrationWarning({ oldEntrypointName, newEntrypointName, newPackageName = "@langchain/community", }) {
    let finalEntrypointName = "";
    if (newEntrypointName === undefined) {
        finalEntrypointName = `/${oldEntrypointName}`;
    }
    else if (newEntrypointName !== "") {
        finalEntrypointName = `/${newEntrypointName}`;
    }
    let warningText = [
        `[WARNING]: Importing from "langchain/${oldEntrypointName}" is deprecated.`,
        ``,
        `Instead, please add the "${newPackageName}" package to your project with e.g.`,
        ``,
        `    $ npm install ${newPackageName}`,
        ``,
        `and import from "${newPackageName}${finalEntrypointName}".`,
        ``,
        `This will be mandatory after the next "langchain" minor version bump to 0.2.`,
    ].join("\n");
    if (newPackageName === "@langchain/core") {
        warningText = [
            `[WARNING]: Importing from "langchain/${oldEntrypointName}" is deprecated.`,
            ``,
            `Instead, please import from "${newPackageName}${finalEntrypointName}".`,
            ``,
            `This will be mandatory after the next "langchain" minor version bump to 0.2.`,
        ].join("\n");
    }
    if ((0, env_js_1.getEnvironmentVariable)("LANGCHAIN_SUPPRESS_MIGRATION_WARNINGS") !== "true") {
        console.warn(warningText);
    }
}
exports.logVersion010MigrationWarning = logVersion010MigrationWarning;
function logVersion020MigrationWarning({ oldEntrypointName, newEntrypointName, newPackageName = "@langchain/community", }) {
    let finalEntrypointName = "";
    if (newEntrypointName === undefined) {
        finalEntrypointName = `/${oldEntrypointName}`;
    }
    else if (newEntrypointName !== "") {
        finalEntrypointName = `/${newEntrypointName}`;
    }
    let warningText = [
        `[WARNING]: Importing from "langchain/${oldEntrypointName}" is deprecated.`,
        ``,
        `Instead, please add the "${newPackageName}" package to your project with e.g.`,
        ``,
        `    $ npm install ${newPackageName}`,
        ``,
        `and import from "${newPackageName}${finalEntrypointName}".`,
        ``,
        `This will be mandatory after the next "langchain" minor version bump to 0.3.`,
    ].join("\n");
    if (newPackageName === "@langchain/core") {
        warningText = [
            `[WARNING]: Importing from "langchain/${oldEntrypointName}" is deprecated.`,
            ``,
            `Instead, please import from "${newPackageName}${finalEntrypointName}".`,
            ``,
            `This will be mandatory after the next "langchain" minor version bump to 0.3.`,
        ].join("\n");
    }
    if ((0, env_js_1.getEnvironmentVariable)("LANGCHAIN_SUPPRESS_MIGRATION_WARNINGS") !== "true") {
        console.warn(warningText);
    }
}
exports.logVersion020MigrationWarning = logVersion020MigrationWarning;
