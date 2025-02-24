import { FewShotPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
export declare const critiqueExample: PromptTemplate<{
    input_prompt: any;
    output_from_model: any;
    critique_request: any;
    critique: any;
    revision_request: any;
    revision: any;
}, any>;
export declare const examples: {
    input_prompt: string;
    output_from_model: string;
    critique_request: string;
    critique: string;
    revision_request: string;
    revision: string;
}[];
export declare const CRITIQUE_PROMPT: FewShotPromptTemplate;
export declare const REVISION_PROMPT: FewShotPromptTemplate;
