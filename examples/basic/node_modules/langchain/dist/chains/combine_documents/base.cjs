"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDocuments = exports.DEFAULT_DOCUMENT_PROMPT = exports.INTERMEDIATE_STEPS_KEY = exports.DOCUMENTS_KEY = exports.DEFAULT_DOCUMENT_SEPARATOR = void 0;
const prompts_1 = require("@langchain/core/prompts");
exports.DEFAULT_DOCUMENT_SEPARATOR = "\n\n";
exports.DOCUMENTS_KEY = "context";
exports.INTERMEDIATE_STEPS_KEY = "intermediate_steps";
exports.DEFAULT_DOCUMENT_PROMPT = 
/* #__PURE__ */ prompts_1.PromptTemplate.fromTemplate("{page_content}");
async function formatDocuments({ documentPrompt, documentSeparator, documents, config, }) {
    if (documents == null || documents.length === 0) {
        return "";
    }
    const formattedDocs = await Promise.all(documents.map((document) => documentPrompt
        .withConfig({ runName: "document_formatter" })
        .invoke({ ...document.metadata, page_content: document.pageContent }, config)));
    return formattedDocs.join(documentSeparator);
}
exports.formatDocuments = formatDocuments;
