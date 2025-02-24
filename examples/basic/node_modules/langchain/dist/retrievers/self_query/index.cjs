"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfQueryRetriever = exports.FunctionalTranslator = exports.BasicTranslator = exports.BaseTranslator = void 0;
const retrievers_1 = require("@langchain/core/retrievers");
const structured_query_1 = require("@langchain/core/structured_query");
Object.defineProperty(exports, "BaseTranslator", { enumerable: true, get: function () { return structured_query_1.BaseTranslator; } });
Object.defineProperty(exports, "BasicTranslator", { enumerable: true, get: function () { return structured_query_1.BasicTranslator; } });
Object.defineProperty(exports, "FunctionalTranslator", { enumerable: true, get: function () { return structured_query_1.FunctionalTranslator; } });
const index_js_1 = require("../../chains/query_constructor/index.cjs");
/**
 * Class for question answering over an index. It retrieves relevant
 * documents based on a query. It extends the BaseRetriever class and
 * implements the SelfQueryRetrieverArgs interface.
 * @example
 * ```typescript
 * const selfQueryRetriever = SelfQueryRetriever.fromLLM({
 *   llm: new ChatOpenAI(),
 *   vectorStore: await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings()),
 *   documentContents: "Brief summary of a movie",
 *   attributeInfo: attributeInfo,
 *   structuredQueryTranslator: new FunctionalTranslator(),
 * });
 * const relevantDocuments = await selfQueryRetriever.getRelevantDocuments(
 *   "Which movies are directed by Greta Gerwig?",
 * );
 * ```
 */
class SelfQueryRetriever extends retrievers_1.BaseRetriever {
    static lc_name() {
        return "SelfQueryRetriever";
    }
    get lc_namespace() {
        return ["langchain", "retrievers", "self_query"];
    }
    constructor(options) {
        super(options);
        Object.defineProperty(this, "vectorStore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "queryConstructor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "verbose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "structuredQueryTranslator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "useOriginalQuery", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "searchParams", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { k: 4, forceDefaultFilter: false }
        });
        this.vectorStore = options.vectorStore;
        this.queryConstructor = options.queryConstructor;
        this.verbose = options.verbose ?? false;
        this.searchParams = options.searchParams ?? this.searchParams;
        this.useOriginalQuery = options.useOriginalQuery ?? this.useOriginalQuery;
        this.structuredQueryTranslator = options.structuredQueryTranslator;
    }
    async _getRelevantDocuments(query, runManager) {
        const generatedStructuredQuery = await this.queryConstructor.invoke({ query }, {
            callbacks: runManager?.getChild("query_constructor"),
            runName: "query_constructor",
        });
        const nextArg = this.structuredQueryTranslator.visitStructuredQuery(generatedStructuredQuery);
        const filter = this.structuredQueryTranslator.mergeFilters(this.searchParams?.filter, nextArg.filter, this.searchParams?.mergeFiltersOperator, this.searchParams?.forceDefaultFilter);
        const generatedQuery = generatedStructuredQuery.query;
        let myQuery = query;
        if (!this.useOriginalQuery && generatedQuery && generatedQuery.length > 0) {
            myQuery = generatedQuery;
        }
        return this.vectorStore
            .asRetriever({
            k: this.searchParams?.k,
            filter,
        })
            .invoke(myQuery, { callbacks: runManager?.getChild("retriever") });
    }
    /**
     * Static method to create a new SelfQueryRetriever instance from a
     * BaseLanguageModel and a VectorStore. It first loads a query constructor
     * chain using the loadQueryConstructorChain function, then creates a new
     * SelfQueryRetriever instance with the loaded chain and the provided
     * options.
     * @param options The options used to create the SelfQueryRetriever instance. It includes the QueryConstructorChainOptions and all the SelfQueryRetrieverArgs except 'llmChain'.
     * @returns A new instance of SelfQueryRetriever.
     */
    static fromLLM(options) {
        const { structuredQueryTranslator, allowedComparators, allowedOperators, llm, documentContents, attributeInfo, examples, vectorStore, ...rest } = options;
        const queryConstructor = (0, index_js_1.loadQueryConstructorRunnable)({
            llm,
            documentContents,
            attributeInfo,
            examples,
            allowedComparators: allowedComparators ?? structuredQueryTranslator.allowedComparators,
            allowedOperators: allowedOperators ?? structuredQueryTranslator.allowedOperators,
        });
        return new SelfQueryRetriever({
            ...rest,
            queryConstructor,
            vectorStore,
            structuredQueryTranslator,
        });
    }
}
exports.SelfQueryRetriever = SelfQueryRetriever;
