import { Document } from "@langchain/core/documents";
import { BasePromptTemplate } from "@langchain/core/prompts";
/**
 * @deprecated
 * Formats a document using a given prompt template.
 *
 * @async
 * @param {Document} document - The document to format.
 * @param {BasePromptTemplate} prompt - The prompt template to use for formatting.
 * @returns {Promise<string>} A Promise that resolves to the formatted document as a string.
 * @throws {Error} If the document is missing required metadata variables specified in the prompt template.
 */
export declare const formatDocument: (document: Document, prompt: BasePromptTemplate) => Promise<string>;
