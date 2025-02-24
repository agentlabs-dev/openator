"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PROMPT = void 0;
/* eslint-disable spaced-comment */
const prompts_1 = require("@langchain/core/prompts");
const template = `Write a concise summary of the following:


"{text}"


CONCISE SUMMARY:`;
exports.DEFAULT_PROMPT = new prompts_1.PromptTemplate({
    template,
    inputVariables: ["text"],
});
