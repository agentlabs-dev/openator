"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const openai_1 = require("@langchain/openai");
const documents_1 = require("@langchain/core/documents");
const text_splitter_js_1 = require("../../../text_splitter.cjs");
const embeddings_filter_js_1 = require("../embeddings_filter.cjs");
const index_js_1 = require("../index.cjs");
(0, globals_1.test)("Test DocumentCompressorPipeline", async () => {
    const embeddings = new openai_1.OpenAIEmbeddings();
    const splitter = new text_splitter_js_1.RecursiveCharacterTextSplitter({
        chunkSize: 30,
        chunkOverlap: 0,
        separators: [". "],
    });
    const relevantFilter = new embeddings_filter_js_1.EmbeddingsFilter({
        embeddings,
        similarityThreshold: 0.8,
    });
    const pipelineFilter = new index_js_1.DocumentCompressorPipeline({
        transformers: [splitter, relevantFilter],
    });
    const texts = ["This sentence is about cows", "foo bar baz"];
    const docs = [new documents_1.Document({ pageContent: texts.join(". ") })];
    const actual = await pipelineFilter.compressDocuments(docs, "Tell me about farm animals");
    (0, globals_1.expect)(actual.length).toBe(1);
    (0, globals_1.expect)(texts[0].includes(actual[0].pageContent)).toBeTruthy();
});
