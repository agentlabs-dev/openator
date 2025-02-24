"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROMPT_WITH_REFERENCES = exports.CRITERIA_PROMPT = void 0;
const prompts_1 = require("@langchain/core/prompts");
const template = `You are assessing a submitted answer on a given task or input based on a set of criteria. Here is the data:
[BEGIN DATA]
***
[Input]: {input}
***
[Submission]: {output}
***
[Criteria]: {criteria}
***
[END DATA]
Does the submission meet the Criteria? First, write out in a step by step manner your reasoning about each criterion to be sure that your conclusion is correct. Avoid simply stating the correct answers at the outset. Then print only the single character "Y" or "N" (without quotes or punctuation) on its own line corresponding to the correct answer of whether the submission meets all criteria. At the end, repeat just the letter again by itself on a new line.`;
exports.CRITERIA_PROMPT = new prompts_1.PromptTemplate({
    inputVariables: ["input", "output", "criteria"],
    template,
});
const referenceTemplate = `You are assessing a submitted answer on a given task or input based on a set of criteria. Here is the data:
[BEGIN DATA]
***
[Input]: {input}
***
[Submission]: {output}
***
[Criteria]: {criteria}
***
[Reference]: {reference}
***
[END DATA]
Does the submission meet the Criteria? First, write out in a step by step manner your reasoning about each criterion to be sure that your conclusion is correct. Avoid simply stating the correct answers at the outset. Then print only the single character "Y" or "N" (without quotes or punctuation) on its own line corresponding to the correct answer of whether the submission meets all criteria. At the end, repeat just the letter again by itself on a new line.`;
exports.PROMPT_WITH_REFERENCES = new prompts_1.PromptTemplate({
    inputVariables: ["input", "output", "criteria", "reference"],
    template: referenceTemplate,
});
