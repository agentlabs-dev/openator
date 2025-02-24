"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatLogToString = void 0;
/**
 * Construct the scratchpad that lets the agent continue its thought process.
 * @param intermediateSteps
 * @param observationPrefix
 * @param llmPrefix
 * @returns a string with the formatted observations and agent logs
 */
function formatLogToString(intermediateSteps, observationPrefix = "Observation: ", llmPrefix = "Thought: ") {
    const formattedSteps = intermediateSteps.reduce((thoughts, { action, observation }) => thoughts +
        [action.log, `\n${observationPrefix}${observation}`, llmPrefix].join("\n"), "");
    return formattedSteps;
}
exports.formatLogToString = formatLogToString;
