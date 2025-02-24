import { BaseRetriever, } from "@langchain/core/retrievers";
import { BaseOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "../chains/llm_chain.js";
class LineListOutputParser extends BaseOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "retrievers", "multiquery"]
        });
    }
    static lc_name() {
        return "LineListOutputParser";
    }
    async parse(text) {
        const startKeyIndex = text.indexOf("<questions>");
        const endKeyIndex = text.indexOf("</questions>");
        const questionsStartIndex = startKeyIndex === -1 ? 0 : startKeyIndex + "<questions>".length;
        const questionsEndIndex = endKeyIndex === -1 ? text.length : endKeyIndex;
        const lines = text
            .slice(questionsStartIndex, questionsEndIndex)
            .trim()
            .split("\n")
            .filter((line) => line.trim() !== "");
        return { lines };
    }
    getFormatInstructions() {
        throw new Error("Not implemented.");
    }
}
// Create template
const DEFAULT_QUERY_PROMPT = /* #__PURE__ */ new PromptTemplate({
    inputVariables: ["question", "queryCount"],
    template: `You are an AI language model assistant. Your task is
to generate {queryCount} different versions of the given user
question to retrieve relevant documents from a vector database.
By generating multiple perspectives on the user question,
your goal is to help the user overcome some of the limitations
of distance-based similarity search.

Provide these alternative questions separated by newlines between XML tags. For example:

<questions>
Question 1
Question 2
Question 3
</questions>

Original question: {question}`,
});
/**
 * @example
 * ```typescript
 * const retriever = new MultiQueryRetriever.fromLLM({
 *   llm: new ChatAnthropic({}),
 *   retriever: new MemoryVectorStore().asRetriever(),
 *   verbose: true,
 * });
 * const retrievedDocs = await retriever.getRelevantDocuments(
 *   "What are mitochondria made of?",
 * );
 * ```
 */
export class MultiQueryRetriever extends BaseRetriever {
    static lc_name() {
        return "MultiQueryRetriever";
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "retrievers", "multiquery"]
        });
        Object.defineProperty(this, "retriever", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "llmChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "queryCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 3
        });
        Object.defineProperty(this, "parserKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "lines"
        });
        Object.defineProperty(this, "documentCompressor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "documentCompressorFilteringFn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.retriever = fields.retriever;
        this.llmChain = fields.llmChain;
        this.queryCount = fields.queryCount ?? this.queryCount;
        this.parserKey = fields.parserKey ?? this.parserKey;
        this.documentCompressor = fields.documentCompressor;
        this.documentCompressorFilteringFn = fields.documentCompressorFilteringFn;
    }
    static fromLLM(fields) {
        const { retriever, llm, prompt = DEFAULT_QUERY_PROMPT, queryCount, parserKey, ...rest } = fields;
        const outputParser = new LineListOutputParser();
        const llmChain = new LLMChain({ llm, prompt, outputParser });
        return new this({ retriever, llmChain, queryCount, parserKey, ...rest });
    }
    // Generate the different queries for each retrieval, using our llmChain
    async _generateQueries(question, runManager) {
        const response = await this.llmChain.call({ question, queryCount: this.queryCount }, runManager?.getChild());
        const lines = response.text[this.parserKey] || [];
        if (this.verbose) {
            console.log(`Generated queries: ${lines}`);
        }
        return lines;
    }
    // Retrieve documents using the original retriever
    async _retrieveDocuments(queries, runManager) {
        const documents = [];
        await Promise.all(queries.map(async (query) => {
            const docs = await this.retriever.getRelevantDocuments(query, runManager?.getChild());
            documents.push(...docs);
        }));
        return documents;
    }
    // Deduplicate the documents that were returned in multiple retrievals
    _uniqueUnion(documents) {
        const uniqueDocumentsDict = {};
        for (const doc of documents) {
            const key = `${doc.pageContent}:${JSON.stringify(Object.entries(doc.metadata).sort())}`;
            uniqueDocumentsDict[key] = doc;
        }
        const uniqueDocuments = Object.values(uniqueDocumentsDict);
        return uniqueDocuments;
    }
    async _getRelevantDocuments(question, runManager) {
        const queries = await this._generateQueries(question, runManager);
        const documents = await this._retrieveDocuments(queries, runManager);
        const uniqueDocuments = this._uniqueUnion(documents);
        let outputDocs = uniqueDocuments;
        if (this.documentCompressor && uniqueDocuments.length) {
            outputDocs = await this.documentCompressor.compressDocuments(uniqueDocuments, question, runManager?.getChild());
            if (this.documentCompressorFilteringFn) {
                outputDocs = this.documentCompressorFilteringFn(outputDocs);
            }
        }
        return outputDocs;
    }
}
