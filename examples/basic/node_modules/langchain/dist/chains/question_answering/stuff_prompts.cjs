"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QA_PROMPT_SELECTOR = exports.DEFAULT_QA_PROMPT = void 0;
/* eslint-disable spaced-comment */
const prompts_1 = require("@langchain/core/prompts");
const example_selectors_1 = require("@langchain/core/example_selectors");
exports.DEFAULT_QA_PROMPT = new prompts_1.PromptTemplate({
    template: "Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.\n\n{context}\n\nQuestion: {question}\nHelpful Answer:",
    inputVariables: ["context", "question"],
});
const system_template = `Use the following pieces of context to answer the users question. 
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
{context}`;
const messages = [
    /*#__PURE__*/ prompts_1.SystemMessagePromptTemplate.fromTemplate(system_template),
    /*#__PURE__*/ prompts_1.HumanMessagePromptTemplate.fromTemplate("{question}"),
];
const CHAT_PROMPT = /*#__PURE__*/ prompts_1.ChatPromptTemplate.fromMessages(messages);
exports.QA_PROMPT_SELECTOR = new example_selectors_1.ConditionalPromptSelector(exports.DEFAULT_QA_PROMPT, [[example_selectors_1.isChatModel, CHAT_PROMPT]]);
