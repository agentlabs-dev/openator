"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMChainExtractor = void 0;
const documents_1 = require("@langchain/core/documents");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const llm_chain_js_1 = require("../../chains/llm_chain.cjs");
const index_js_1 = require("./index.cjs");
const chain_extract_prompt_js_1 = require("./chain_extract_prompt.cjs");
function defaultGetInput(query, doc) {
    return { question: query, context: doc.pageContent };
}
class NoOutputParser extends output_parsers_1.BaseOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [
                "langchain",
                "retrievers",
                "document_compressors",
                "chain_extract",
            ]
        });
        Object.defineProperty(this, "noOutputStr", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "NO_OUTPUT"
        });
    }
    parse(text) {
        const cleanedText = text.trim();
        if (cleanedText === this.noOutputStr) {
            return Promise.resolve("");
        }
        return Promise.resolve(cleanedText);
    }
    getFormatInstructions() {
        throw new Error("Method not implemented.");
    }
}
function getDefaultChainPrompt() {
    const outputParser = new NoOutputParser();
    const template = (0, chain_extract_prompt_js_1.PROMPT_TEMPLATE)(outputParser.noOutputStr);
    return new prompts_1.PromptTemplate({
        template,
        inputVariables: ["question", "context"],
        outputParser,
    });
}
/**
 * A class that uses an LLM chain to extract relevant parts of documents.
 * It extends the BaseDocumentCompressor class.
 */
class LLMChainExtractor extends index_js_1.BaseDocumentCompressor {
    constructor({ llmChain, getInput }) {
        super();
        Object.defineProperty(this, "llmChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "getInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: defaultGetInput
        });
        this.llmChain = llmChain;
        this.getInput = getInput;
    }
    /**
     * Compresses a list of documents based on the output of an LLM chain.
     * @param documents The list of documents to be compressed.
     * @param query The query to be used for document compression.
     * @returns A list of compressed documents.
     */
    async compressDocuments(documents, query) {
        const compressedDocs = await Promise.all(documents.map(async (doc) => {
            const input = this.getInput(query, doc);
            const output = await this.llmChain.predict(input);
            return output.length > 0
                ? new documents_1.Document({
                    pageContent: output,
                    metadata: doc.metadata,
                })
                : undefined;
        }));
        return compressedDocs.filter((doc) => doc !== undefined);
    }
    /**
     * Creates a new instance of LLMChainExtractor from a given LLM, prompt
     * template, and getInput function.
     * @param llm The BaseLanguageModel instance used for document extraction.
     * @param prompt The PromptTemplate instance used for document extraction.
     * @param getInput A function used for constructing the chain input from the query and a Document.
     * @returns A new instance of LLMChainExtractor.
     */
    static fromLLM(llm, prompt, getInput) {
        const _prompt = prompt || getDefaultChainPrompt();
        const _getInput = getInput || defaultGetInput;
        const llmChain = new llm_chain_js_1.LLMChain({ llm, prompt: _prompt });
        return new LLMChainExtractor({ llmChain, getInput: _getInput });
    }
}
exports.LLMChainExtractor = LLMChainExtractor;
