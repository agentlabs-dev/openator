/* eslint-disable no-promise-executor-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseChatMessageHistory, BaseListChatMessageHistory, } from "../../chat_history.js";
import { Document } from "../../documents/document.js";
import { BaseChatModel, } from "../../language_models/chat_models.js";
import { LLM } from "../../language_models/llms.js";
import { AIMessage, AIMessageChunk, HumanMessage, } from "../../messages/index.js";
import { BaseOutputParser } from "../../output_parsers/base.js";
import { ChatGenerationChunk, } from "../../outputs.js";
import { BaseRetriever } from "../../retrievers/index.js";
import { Runnable, RunnableLambda } from "../../runnables/base.js";
import { StructuredTool } from "../../tools/index.js";
import { BaseTracer } from "../../tracers/base.js";
import { Embeddings, } from "../../embeddings.js";
import { VectorStore } from "../../vectorstores.js";
import { cosine } from "../ml-distance/similarities.js";
/**
 * Parser for comma-separated values. It splits the input text by commas
 * and trims the resulting values.
 */
export class FakeSplitIntoListParser extends BaseOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["tests", "fake"]
        });
    }
    getFormatInstructions() {
        return "";
    }
    async parse(text) {
        return text.split(",").map((value) => value.trim());
    }
}
export class FakeRunnable extends Runnable {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["tests", "fake"]
        });
        Object.defineProperty(this, "returnOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.returnOptions = fields.returnOptions;
    }
    async invoke(input, options) {
        if (this.returnOptions) {
            return options ?? {};
        }
        return { input };
    }
}
export class FakeLLM extends LLM {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "response", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "thrownErrorString", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.response = fields.response;
        this.thrownErrorString = fields.thrownErrorString;
    }
    _llmType() {
        return "fake";
    }
    async _call(prompt, _options, runManager) {
        if (this.thrownErrorString) {
            throw new Error(this.thrownErrorString);
        }
        const response = this.response ?? prompt;
        await runManager?.handleLLMNewToken(response);
        return response;
    }
}
export class FakeStreamingLLM extends LLM {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "sleep", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 50
        });
        Object.defineProperty(this, "responses", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "thrownErrorString", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.sleep = fields.sleep ?? this.sleep;
        this.responses = fields.responses;
        this.thrownErrorString = fields.thrownErrorString;
    }
    _llmType() {
        return "fake";
    }
    async _call(prompt) {
        if (this.thrownErrorString) {
            throw new Error(this.thrownErrorString);
        }
        const response = this.responses?.[0];
        this.responses = this.responses?.slice(1);
        return response ?? prompt;
    }
    async *_streamResponseChunks(input, _options, runManager) {
        if (this.thrownErrorString) {
            throw new Error(this.thrownErrorString);
        }
        const response = this.responses?.[0];
        this.responses = this.responses?.slice(1);
        for (const c of response ?? input) {
            await new Promise((resolve) => setTimeout(resolve, this.sleep));
            yield { text: c, generationInfo: {} };
            await runManager?.handleLLMNewToken(c);
        }
    }
}
export class FakeChatModel extends BaseChatModel {
    _combineLLMOutput() {
        return [];
    }
    _llmType() {
        return "fake";
    }
    async _generate(messages, options, runManager) {
        if (options?.stop?.length) {
            return {
                generations: [
                    {
                        message: new AIMessage(options.stop[0]),
                        text: options.stop[0],
                    },
                ],
            };
        }
        const text = messages
            .map((m) => {
            if (typeof m.content === "string") {
                return m.content;
            }
            return JSON.stringify(m.content, null, 2);
        })
            .join("\n");
        await runManager?.handleLLMNewToken(text);
        return {
            generations: [
                {
                    message: new AIMessage(text),
                    text,
                },
            ],
            llmOutput: {},
        };
    }
}
export class FakeStreamingChatModel extends BaseChatModel {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "sleep", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 50
        });
        Object.defineProperty(this, "responses", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "thrownErrorString", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.sleep = fields.sleep ?? this.sleep;
        this.responses = fields.responses;
        this.thrownErrorString = fields.thrownErrorString;
    }
    _llmType() {
        return "fake";
    }
    async _generate(messages, _options, _runManager) {
        if (this.thrownErrorString) {
            throw new Error(this.thrownErrorString);
        }
        const content = this.responses?.[0].content ?? messages[0].content;
        const generation = {
            generations: [
                {
                    text: "",
                    message: new AIMessage({
                        content,
                    }),
                },
            ],
        };
        return generation;
    }
    async *_streamResponseChunks(messages, _options, _runManager) {
        if (this.thrownErrorString) {
            throw new Error(this.thrownErrorString);
        }
        const content = this.responses?.[0].content ?? messages[0].content;
        if (typeof content !== "string") {
            for (const _ of this.responses ?? messages) {
                yield new ChatGenerationChunk({
                    text: "",
                    message: new AIMessageChunk({
                        content,
                    }),
                });
            }
        }
        else {
            for (const _ of this.responses ?? messages) {
                yield new ChatGenerationChunk({
                    text: content,
                    message: new AIMessageChunk({
                        content,
                    }),
                });
            }
        }
    }
}
export class FakeRetriever extends BaseRetriever {
    constructor(fields) {
        super();
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["test", "fake"]
        });
        Object.defineProperty(this, "output", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [
                new Document({ pageContent: "foo" }),
                new Document({ pageContent: "bar" }),
            ]
        });
        this.output = fields?.output ?? this.output;
    }
    async _getRelevantDocuments(_query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) {
        return this.output;
    }
}
/**
 * A fake Chat Model that returns a predefined list of responses. It can be used
 * for testing purposes.
 * @example
 * ```typescript
 * const chat = new FakeListChatModel({
 *   responses: ["I'll callback later.", "You 'console' them!"]
 * });
 *
 * const firstMessage = new HumanMessage("You want to hear a JavaScript joke?");
 * const secondMessage = new HumanMessage("How do you cheer up a JavaScript developer?");
 *
 * // Call the chat model with a message and log the response
 * const firstResponse = await chat.call([firstMessage]);
 * console.log({ firstResponse });
 *
 * const secondResponse = await chat.call([secondMessage]);
 * console.log({ secondResponse });
 * ```
 */
export class FakeListChatModel extends BaseChatModel {
    static lc_name() {
        return "FakeListChatModel";
    }
    constructor(params) {
        super(params);
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "responses", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "i", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "sleep", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "emitCustomEvent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        const { responses, sleep, emitCustomEvent } = params;
        this.responses = responses;
        this.sleep = sleep;
        this.emitCustomEvent = emitCustomEvent ?? this.emitCustomEvent;
    }
    _combineLLMOutput() {
        return [];
    }
    _llmType() {
        return "fake-list";
    }
    async _generate(_messages, options, runManager) {
        await this._sleepIfRequested();
        if (options?.thrownErrorString) {
            throw new Error(options.thrownErrorString);
        }
        if (this.emitCustomEvent) {
            await runManager?.handleCustomEvent("some_test_event", {
                someval: true,
            });
        }
        if (options?.stop?.length) {
            return {
                generations: [this._formatGeneration(options.stop[0])],
            };
        }
        else {
            const response = this._currentResponse();
            this._incrementResponse();
            return {
                generations: [this._formatGeneration(response)],
                llmOutput: {},
            };
        }
    }
    _formatGeneration(text) {
        return {
            message: new AIMessage(text),
            text,
        };
    }
    async *_streamResponseChunks(_messages, options, runManager) {
        const response = this._currentResponse();
        this._incrementResponse();
        if (this.emitCustomEvent) {
            await runManager?.handleCustomEvent("some_test_event", {
                someval: true,
            });
        }
        for await (const text of response) {
            await this._sleepIfRequested();
            if (options?.thrownErrorString) {
                throw new Error(options.thrownErrorString);
            }
            const chunk = this._createResponseChunk(text);
            yield chunk;
            void runManager?.handleLLMNewToken(text);
        }
    }
    async _sleepIfRequested() {
        if (this.sleep !== undefined) {
            await this._sleep();
        }
    }
    async _sleep() {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), this.sleep);
        });
    }
    _createResponseChunk(text) {
        return new ChatGenerationChunk({
            message: new AIMessageChunk({ content: text }),
            text,
        });
    }
    _currentResponse() {
        return this.responses[this.i];
    }
    _incrementResponse() {
        if (this.i < this.responses.length - 1) {
            this.i += 1;
        }
        else {
            this.i = 0;
        }
    }
    withStructuredOutput(_params, _config) {
        return RunnableLambda.from(async (input) => {
            const message = await this.invoke(input);
            return JSON.parse(message.content);
        });
    }
}
export class FakeChatMessageHistory extends BaseChatMessageHistory {
    constructor() {
        super();
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "message", "fake"]
        });
        Object.defineProperty(this, "messages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    async getMessages() {
        return this.messages;
    }
    async addMessage(message) {
        this.messages.push(message);
    }
    async addUserMessage(message) {
        this.messages.push(new HumanMessage(message));
    }
    async addAIChatMessage(message) {
        this.messages.push(new AIMessage(message));
    }
    async clear() {
        this.messages = [];
    }
}
export class FakeListChatMessageHistory extends BaseListChatMessageHistory {
    constructor() {
        super();
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain_core", "message", "fake"]
        });
        Object.defineProperty(this, "messages", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    async addMessage(message) {
        this.messages.push(message);
    }
    async getMessages() {
        return this.messages;
    }
}
export class FakeTracer extends BaseTracer {
    constructor() {
        super();
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "fake_tracer"
        });
        Object.defineProperty(this, "runs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    persistRun(run) {
        this.runs.push(run);
        return Promise.resolve();
    }
}
export class FakeTool extends StructuredTool {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "schema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = fields.name;
        this.description = fields.description;
        this.schema = fields.schema;
    }
    async _call(arg, _runManager) {
        return JSON.stringify(arg);
    }
}
/**
 * A class that provides fake embeddings by overriding the embedDocuments
 * and embedQuery methods to return fixed values.
 */
export class FakeEmbeddings extends Embeddings {
    constructor(params) {
        super(params ?? {});
    }
    /**
     * Generates fixed embeddings for a list of documents.
     * @param documents List of documents to generate embeddings for.
     * @returns A promise that resolves with a list of fixed embeddings for each document.
     */
    embedDocuments(documents) {
        return Promise.resolve(documents.map(() => [0.1, 0.2, 0.3, 0.4]));
    }
    /**
     * Generates a fixed embedding for a query.
     * @param _ The query to generate an embedding for.
     * @returns A promise that resolves with a fixed embedding for the query.
     */
    embedQuery(_) {
        return Promise.resolve([0.1, 0.2, 0.3, 0.4]);
    }
}
/**
 * A class that provides synthetic embeddings by overriding the
 * embedDocuments and embedQuery methods to generate embeddings based on
 * the input documents. The embeddings are generated by converting each
 * document into chunks, calculating a numerical value for each chunk, and
 * returning an array of these values as the embedding.
 */
export class SyntheticEmbeddings extends Embeddings {
    constructor(params) {
        super(params ?? {});
        Object.defineProperty(this, "vectorSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.vectorSize = params?.vectorSize ?? 4;
    }
    /**
     * Generates synthetic embeddings for a list of documents.
     * @param documents List of documents to generate embeddings for.
     * @returns A promise that resolves with a list of synthetic embeddings for each document.
     */
    async embedDocuments(documents) {
        return Promise.all(documents.map((doc) => this.embedQuery(doc)));
    }
    /**
     * Generates a synthetic embedding for a document. The document is
     * converted into chunks, a numerical value is calculated for each chunk,
     * and an array of these values is returned as the embedding.
     * @param document The document to generate an embedding for.
     * @returns A promise that resolves with a synthetic embedding for the document.
     */
    async embedQuery(document) {
        let doc = document;
        // Only use the letters (and space) from the document, and make them lower case
        doc = doc.toLowerCase().replaceAll(/[^a-z ]/g, "");
        // Pad the document to make sure it has a divisible number of chunks
        const padMod = doc.length % this.vectorSize;
        const padGapSize = padMod === 0 ? 0 : this.vectorSize - padMod;
        const padSize = doc.length + padGapSize;
        doc = doc.padEnd(padSize, " ");
        // Break it into chunks
        const chunkSize = doc.length / this.vectorSize;
        const docChunk = [];
        for (let co = 0; co < doc.length; co += chunkSize) {
            docChunk.push(doc.slice(co, co + chunkSize));
        }
        // Turn each chunk into a number
        const ret = docChunk.map((s) => {
            let sum = 0;
            // Get a total value by adding the value of each character in the string
            for (let co = 0; co < s.length; co += 1) {
                sum += s === " " ? 0 : s.charCodeAt(co);
            }
            // Reduce this to a number between 0 and 25 inclusive
            // Then get the fractional number by dividing it by 26
            const ret = (sum % 26) / 26;
            return ret;
        });
        return ret;
    }
}
export class SingleRunExtractor extends BaseTracer {
    constructor() {
        super();
        Object.defineProperty(this, "runPromiseResolver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "runPromise", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** The name of the callback handler. */
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "single_run_extractor"
        });
        this.runPromise = new Promise((extract) => {
            this.runPromiseResolver = extract;
        });
    }
    async persistRun(run) {
        this.runPromiseResolver(run);
    }
    async extract() {
        return this.runPromise;
    }
}
/**
 * Class that extends `VectorStore` to store vectors in memory. Provides
 * methods for adding documents, performing similarity searches, and
 * creating instances from texts, documents, or an existing index.
 */
export class FakeVectorStore extends VectorStore {
    _vectorstoreType() {
        return "memory";
    }
    constructor(embeddings, { similarity, ...rest } = {}) {
        super(embeddings, rest);
        Object.defineProperty(this, "memoryVectors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "similarity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.similarity = similarity ?? cosine;
    }
    /**
     * Method to add documents to the memory vector store. It extracts the
     * text from each document, generates embeddings for them, and adds the
     * resulting vectors to the store.
     * @param documents Array of `Document` instances to be added to the store.
     * @returns Promise that resolves when all documents have been added.
     */
    async addDocuments(documents) {
        const texts = documents.map(({ pageContent }) => pageContent);
        return this.addVectors(await this.embeddings.embedDocuments(texts), documents);
    }
    /**
     * Method to add vectors to the memory vector store. It creates
     * `MemoryVector` instances for each vector and document pair and adds
     * them to the store.
     * @param vectors Array of vectors to be added to the store.
     * @param documents Array of `Document` instances corresponding to the vectors.
     * @returns Promise that resolves when all vectors have been added.
     */
    async addVectors(vectors, documents) {
        const memoryVectors = vectors.map((embedding, idx) => ({
            content: documents[idx].pageContent,
            embedding,
            metadata: documents[idx].metadata,
        }));
        this.memoryVectors = this.memoryVectors.concat(memoryVectors);
    }
    /**
     * Method to perform a similarity search in the memory vector store. It
     * calculates the similarity between the query vector and each vector in
     * the store, sorts the results by similarity, and returns the top `k`
     * results along with their scores.
     * @param query Query vector to compare against the vectors in the store.
     * @param k Number of top results to return.
     * @param filter Optional filter function to apply to the vectors before performing the search.
     * @returns Promise that resolves with an array of tuples, each containing a `Document` and its similarity score.
     */
    async similaritySearchVectorWithScore(query, k, filter) {
        const filterFunction = (memoryVector) => {
            if (!filter) {
                return true;
            }
            const doc = new Document({
                metadata: memoryVector.metadata,
                pageContent: memoryVector.content,
            });
            return filter(doc);
        };
        const filteredMemoryVectors = this.memoryVectors.filter(filterFunction);
        const searches = filteredMemoryVectors
            .map((vector, index) => ({
            similarity: this.similarity(query, vector.embedding),
            index,
        }))
            .sort((a, b) => (a.similarity > b.similarity ? -1 : 0))
            .slice(0, k);
        const result = searches.map((search) => [
            new Document({
                metadata: filteredMemoryVectors[search.index].metadata,
                pageContent: filteredMemoryVectors[search.index].content,
            }),
            search.similarity,
        ]);
        return result;
    }
    /**
     * Static method to create a `FakeVectorStore` instance from an array of
     * texts. It creates a `Document` for each text and metadata pair, and
     * adds them to the store.
     * @param texts Array of texts to be added to the store.
     * @param metadatas Array or single object of metadata corresponding to the texts.
     * @param embeddings `Embeddings` instance used to generate embeddings for the texts.
     * @param dbConfig Optional `FakeVectorStoreArgs` to configure the `FakeVectorStore` instance.
     * @returns Promise that resolves with a new `FakeVectorStore` instance.
     */
    static async fromTexts(texts, metadatas, embeddings, dbConfig) {
        const docs = [];
        for (let i = 0; i < texts.length; i += 1) {
            const metadata = Array.isArray(metadatas) ? metadatas[i] : metadatas;
            const newDoc = new Document({
                pageContent: texts[i],
                metadata,
            });
            docs.push(newDoc);
        }
        return FakeVectorStore.fromDocuments(docs, embeddings, dbConfig);
    }
    /**
     * Static method to create a `FakeVectorStore` instance from an array of
     * `Document` instances. It adds the documents to the store.
     * @param docs Array of `Document` instances to be added to the store.
     * @param embeddings `Embeddings` instance used to generate embeddings for the documents.
     * @param dbConfig Optional `FakeVectorStoreArgs` to configure the `FakeVectorStore` instance.
     * @returns Promise that resolves with a new `FakeVectorStore` instance.
     */
    static async fromDocuments(docs, embeddings, dbConfig) {
        const instance = new this(embeddings, dbConfig);
        await instance.addDocuments(docs);
        return instance;
    }
    /**
     * Static method to create a `FakeVectorStore` instance from an existing
     * index. It creates a new `FakeVectorStore` instance without adding any
     * documents or vectors.
     * @param embeddings `Embeddings` instance used to generate embeddings for the documents.
     * @param dbConfig Optional `FakeVectorStoreArgs` to configure the `FakeVectorStore` instance.
     * @returns Promise that resolves with a new `FakeVectorStore` instance.
     */
    static async fromExistingIndex(embeddings, dbConfig) {
        const instance = new this(embeddings, dbConfig);
        return instance;
    }
}
