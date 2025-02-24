"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStuffDocumentsChain = void 0;
const output_parsers_1 = require("@langchain/core/output_parsers");
const runnables_1 = require("@langchain/core/runnables");
const base_js_1 = require("./base.cjs");
/**
 * Create a chain that passes a list of documents to a model.
 *
 * @param llm Language model to use for responding.
 * @param prompt Prompt template. Must contain input variable "context", which will be
    used for passing in the formatted documents.
 * @param outputParser Output parser. Defaults to `StringOutputParser`.
 * @param documentPrompt Prompt used for formatting each document into a string. Input
    variables can be "page_content" or any metadata keys that are in all documents.
    "page_content" will automatically retrieve the `Document.page_content`, and all
    other inputs variables will be automatically retrieved from the `Document.metadata` dictionary. Default to a prompt that only contains `Document.page_content`.
 * @param documentSeparator String separator to use between formatted document strings.
 * @returns An LCEL `Runnable` chain.
    Expects a dictionary as input with a list of `Document`s being passed under
    the "context" key.
    Return type depends on the `output_parser` used.
 */
async function createStuffDocumentsChain({ llm, prompt, outputParser = new output_parsers_1.StringOutputParser(), documentPrompt = base_js_1.DEFAULT_DOCUMENT_PROMPT, documentSeparator = base_js_1.DEFAULT_DOCUMENT_SEPARATOR, }) {
    if (!prompt.inputVariables.includes(base_js_1.DOCUMENTS_KEY)) {
        throw new Error(`Prompt must include a "${base_js_1.DOCUMENTS_KEY}" variable`);
    }
    return runnables_1.RunnableSequence.from([
        runnables_1.RunnablePassthrough.assign({
            [base_js_1.DOCUMENTS_KEY]: new runnables_1.RunnablePick(base_js_1.DOCUMENTS_KEY).pipe((documents, config) => (0, base_js_1.formatDocuments)({
                documents,
                documentPrompt,
                documentSeparator,
                config,
            })),
        }),
        prompt,
        llm,
        outputParser,
    ], "stuff_documents_chain");
}
exports.createStuffDocumentsChain = createStuffDocumentsChain;
