"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUESTION_PROMPT_SELECTOR = exports.CHAT_QUESTION_PROMPT = exports.DEFAULT_TEXT_QA_PROMPT = exports.DEFAULT_TEXT_QA_PROMPT_TMPL = exports.REFINE_PROMPT_SELECTOR = exports.CHAT_REFINE_PROMPT = exports.DEFAULT_REFINE_PROMPT = exports.DEFAULT_REFINE_PROMPT_TMPL = void 0;
/* eslint-disable spaced-comment */
const prompts_1 = require("@langchain/core/prompts");
const example_selectors_1 = require("@langchain/core/example_selectors");
exports.DEFAULT_REFINE_PROMPT_TMPL = `The original question is as follows: {question}
We have provided an existing answer: {existing_answer}
We have the opportunity to refine the existing answer
(only if needed) with some more context below.
------------
{context}
------------
Given the new context, refine the original answer to better answer the question. 
If the context isn't useful, return the original answer.`;
exports.DEFAULT_REFINE_PROMPT = new prompts_1.PromptTemplate({
    inputVariables: ["question", "existing_answer", "context"],
    template: exports.DEFAULT_REFINE_PROMPT_TMPL,
});
const refineTemplate = `The original question is as follows: {question}
We have provided an existing answer: {existing_answer}
We have the opportunity to refine the existing answer
(only if needed) with some more context below.
------------
{context}
------------
Given the new context, refine the original answer to better answer the question. 
If the context isn't useful, return the original answer.`;
const messages = [
    /*#__PURE__*/ prompts_1.HumanMessagePromptTemplate.fromTemplate("{question}"),
    /*#__PURE__*/ prompts_1.AIMessagePromptTemplate.fromTemplate("{existing_answer}"),
    /*#__PURE__*/ prompts_1.HumanMessagePromptTemplate.fromTemplate(refineTemplate),
];
exports.CHAT_REFINE_PROMPT = 
/*#__PURE__*/ prompts_1.ChatPromptTemplate.fromMessages(messages);
exports.REFINE_PROMPT_SELECTOR = 
/*#__PURE__*/ new example_selectors_1.ConditionalPromptSelector(exports.DEFAULT_REFINE_PROMPT, [
    [example_selectors_1.isChatModel, exports.CHAT_REFINE_PROMPT],
]);
exports.DEFAULT_TEXT_QA_PROMPT_TMPL = `Context information is below. 
---------------------
{context}
---------------------
Given the context information and no prior knowledge, answer the question: {question}`;
exports.DEFAULT_TEXT_QA_PROMPT = new prompts_1.PromptTemplate({
    inputVariables: ["context", "question"],
    template: exports.DEFAULT_TEXT_QA_PROMPT_TMPL,
});
const chat_qa_prompt_template = `Context information is below. 
---------------------
{context}
---------------------
Given the context information and no prior knowledge, answer any questions`;
const chat_messages = [
    /*#__PURE__*/ prompts_1.SystemMessagePromptTemplate.fromTemplate(chat_qa_prompt_template),
    /*#__PURE__*/ prompts_1.HumanMessagePromptTemplate.fromTemplate("{question}"),
];
exports.CHAT_QUESTION_PROMPT = 
/*#__PURE__*/ prompts_1.ChatPromptTemplate.fromMessages(chat_messages);
exports.QUESTION_PROMPT_SELECTOR = 
/*#__PURE__*/ new example_selectors_1.ConditionalPromptSelector(exports.DEFAULT_TEXT_QA_PROMPT, [
    [example_selectors_1.isChatModel, exports.CHAT_QUESTION_PROMPT],
]);
