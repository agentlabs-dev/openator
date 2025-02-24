"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatLogToMessage = void 0;
const messages_1 = require("@langchain/core/messages");
const prompts_1 = require("@langchain/core/prompts");
function formatLogToMessage(intermediateSteps, templateToolResponse = "{observation}") {
    // Get all input variables, if there is more than one, throw an error.
    const matches = [...templateToolResponse.matchAll(/{([^}]*)}/g)];
    const stringsInsideBrackets = matches.map((match) => match[1]);
    if (stringsInsideBrackets.length > 1) {
        throw new Error(`templateToolResponse must contain one input variable: ${templateToolResponse}`);
    }
    const thoughts = [];
    for (const step of intermediateSteps) {
        thoughts.push(new messages_1.AIMessage(step.action.log));
        thoughts.push(new messages_1.HumanMessage((0, prompts_1.renderTemplate)(templateToolResponse, "f-string", {
            [stringsInsideBrackets[0]]: step.observation,
        })));
    }
    return thoughts;
}
exports.formatLogToMessage = formatLogToMessage;
