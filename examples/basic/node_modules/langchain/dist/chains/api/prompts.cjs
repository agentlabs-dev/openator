"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_RESPONSE_PROMPT_TEMPLATE = exports.API_RESPONSE_RAW_PROMPT_TEMPLATE = exports.API_URL_PROMPT_TEMPLATE = exports.API_URL_RAW_PROMPT_TEMPLATE = void 0;
/* eslint-disable spaced-comment */
const prompts_1 = require("@langchain/core/prompts");
exports.API_URL_RAW_PROMPT_TEMPLATE = `You are given the below API Documentation:
{api_docs}
Using this documentation, generate the full API url to call for answering the user question.
You should build the API url in order to get a response that is as short as possible, while still getting the necessary information to answer the question. Pay attention to deliberately exclude any unnecessary pieces of data in the API call.

Question:{question}
API url:`;
exports.API_URL_PROMPT_TEMPLATE = new prompts_1.PromptTemplate({
    inputVariables: ["api_docs", "question"],
    template: exports.API_URL_RAW_PROMPT_TEMPLATE,
});
exports.API_RESPONSE_RAW_PROMPT_TEMPLATE = `${exports.API_URL_RAW_PROMPT_TEMPLATE} {api_url}

Here is the response from the API:

{api_response}

Summarize this response to answer the original question.

Summary:`;
exports.API_RESPONSE_PROMPT_TEMPLATE = new prompts_1.PromptTemplate({
    inputVariables: ["api_docs", "question", "api_url", "api_response"],
    template: exports.API_RESPONSE_RAW_PROMPT_TEMPLATE,
});
