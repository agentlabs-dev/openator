import { PromptTemplate } from "@langchain/core/prompts";
export declare const CRITERIA_PROMPT: PromptTemplate<{
    input: any;
    output: any;
    criteria: any;
}, any>;
export declare const PROMPT_WITH_REFERENCES: PromptTemplate<{
    input: any;
    output: any;
    criteria: any;
    reference: any;
}, any>;
