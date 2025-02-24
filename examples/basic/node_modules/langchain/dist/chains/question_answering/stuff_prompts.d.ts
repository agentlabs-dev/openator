import { PromptTemplate } from "@langchain/core/prompts";
import { ConditionalPromptSelector } from "@langchain/core/example_selectors";
export declare const DEFAULT_QA_PROMPT: PromptTemplate<{
    context: any;
    question: any;
}, any>;
export declare const QA_PROMPT_SELECTOR: ConditionalPromptSelector;
