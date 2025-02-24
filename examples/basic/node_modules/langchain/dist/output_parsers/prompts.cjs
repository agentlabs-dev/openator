"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAIVE_FIX_PROMPT = exports.NAIVE_FIX_TEMPLATE = void 0;
const prompts_1 = require("@langchain/core/prompts");
exports.NAIVE_FIX_TEMPLATE = `Instructions:
--------------
{instructions}
--------------
Completion:
--------------
{completion}
--------------

Above, the Completion did not satisfy the constraints given in the Instructions.
Error:
--------------
{error}
--------------

Please try again. Please only respond with an answer that satisfies the constraints laid out in the Instructions:`;
exports.NAIVE_FIX_PROMPT = 
/* #__PURE__ */ prompts_1.PromptTemplate.fromTemplate(exports.NAIVE_FIX_TEMPLATE);
