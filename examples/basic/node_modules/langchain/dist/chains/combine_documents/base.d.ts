import { Document } from "@langchain/core/documents";
import { BasePromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { RunnableConfig } from "@langchain/core/runnables";
export declare const DEFAULT_DOCUMENT_SEPARATOR = "\n\n";
export declare const DOCUMENTS_KEY = "context";
export declare const INTERMEDIATE_STEPS_KEY = "intermediate_steps";
export declare const DEFAULT_DOCUMENT_PROMPT: PromptTemplate<import("@langchain/core/prompts").ParamsFromFString<"{page_content}">, any>;
export declare function formatDocuments({ documentPrompt, documentSeparator, documents, config, }: {
    documentPrompt: BasePromptTemplate;
    documentSeparator: string;
    documents: Document[];
    config?: RunnableConfig;
}): Promise<string>;
