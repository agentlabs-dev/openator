import { PromptTemplate } from "@langchain/core/prompts";
export declare const QA_PROMPT: PromptTemplate<{
    query: any;
    answer: any;
    result: any;
}, any>;
export declare const SQL_PROMPT: PromptTemplate<{
    query: any;
    answer: any;
    result: any;
}, any>;
