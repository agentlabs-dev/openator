import { z } from "zod";
import { BaseCallbackConfig, CallbackManagerForLLMRun, CallbackManagerForToolRun } from "../../callbacks/manager.js";
import { BaseChatMessageHistory, BaseListChatMessageHistory } from "../../chat_history.js";
import { Document } from "../../documents/document.js";
import { BaseChatModel, BaseChatModelCallOptions, BaseChatModelParams } from "../../language_models/chat_models.js";
import { BaseLLMParams, LLM } from "../../language_models/llms.js";
import { BaseMessage, AIMessage } from "../../messages/index.js";
import { BaseOutputParser } from "../../output_parsers/base.js";
import { GenerationChunk, type ChatResult, ChatGenerationChunk } from "../../outputs.js";
import { BaseRetriever } from "../../retrievers/index.js";
import { Runnable } from "../../runnables/base.js";
import { StructuredTool, ToolParams } from "../../tools/index.js";
import { BaseTracer, Run } from "../../tracers/base.js";
import { Embeddings, EmbeddingsInterface, EmbeddingsParams } from "../../embeddings.js";
import { StructuredOutputMethodParams, BaseLanguageModelInput, StructuredOutputMethodOptions } from "../../language_models/base.js";
import { VectorStore } from "../../vectorstores.js";
import { cosine } from "../ml-distance/similarities.js";
/**
 * Parser for comma-separated values. It splits the input text by commas
 * and trims the resulting values.
 */
export declare class FakeSplitIntoListParser extends BaseOutputParser<string[]> {
    lc_namespace: string[];
    getFormatInstructions(): string;
    parse(text: string): Promise<string[]>;
}
export declare class FakeRunnable extends Runnable<string, Record<string, any>> {
    lc_namespace: string[];
    returnOptions?: boolean;
    constructor(fields: {
        returnOptions?: boolean;
    });
    invoke(input: string, options?: Partial<BaseCallbackConfig>): Promise<Record<string, any>>;
}
export declare class FakeLLM extends LLM {
    response?: string;
    thrownErrorString?: string;
    constructor(fields: {
        response?: string;
        thrownErrorString?: string;
    } & BaseLLMParams);
    _llmType(): string;
    _call(prompt: string, _options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): Promise<string>;
}
export declare class FakeStreamingLLM extends LLM {
    sleep?: number;
    responses?: string[];
    thrownErrorString?: string;
    constructor(fields: {
        sleep?: number;
        responses?: string[];
        thrownErrorString?: string;
    } & BaseLLMParams);
    _llmType(): string;
    _call(prompt: string): Promise<string>;
    _streamResponseChunks(input: string, _options?: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): AsyncGenerator<GenerationChunk, void, unknown>;
}
export declare class FakeChatModel extends BaseChatModel {
    _combineLLMOutput(): never[];
    _llmType(): string;
    _generate(messages: BaseMessage[], options?: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): Promise<ChatResult>;
}
export declare class FakeStreamingChatModel extends BaseChatModel {
    sleep?: number;
    responses?: BaseMessage[];
    thrownErrorString?: string;
    constructor(fields: {
        sleep?: number;
        responses?: BaseMessage[];
        thrownErrorString?: string;
    } & BaseLLMParams);
    _llmType(): string;
    _generate(messages: BaseMessage[], _options: this["ParsedCallOptions"], _runManager?: CallbackManagerForLLMRun): Promise<ChatResult>;
    _streamResponseChunks(messages: BaseMessage[], _options: this["ParsedCallOptions"], _runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
}
export declare class FakeRetriever extends BaseRetriever {
    lc_namespace: string[];
    output: Document<Record<string, any>>[];
    constructor(fields?: {
        output: Document[];
    });
    _getRelevantDocuments(_query: string): Promise<Document<Record<string, any>>[]>;
}
/**
 * Interface for the input parameters specific to the Fake List Chat model.
 */
export interface FakeChatInput extends BaseChatModelParams {
    /** Responses to return */
    responses: string[];
    /** Time to sleep in milliseconds between responses */
    sleep?: number;
    emitCustomEvent?: boolean;
}
export interface FakeListChatModelCallOptions extends BaseChatModelCallOptions {
    thrownErrorString?: string;
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
export declare class FakeListChatModel extends BaseChatModel<FakeListChatModelCallOptions> {
    static lc_name(): string;
    lc_serializable: boolean;
    responses: string[];
    i: number;
    sleep?: number;
    emitCustomEvent: boolean;
    constructor(params: FakeChatInput);
    _combineLLMOutput(): never[];
    _llmType(): string;
    _generate(_messages: BaseMessage[], options?: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): Promise<ChatResult>;
    _formatGeneration(text: string): {
        message: AIMessage;
        text: string;
    };
    _streamResponseChunks(_messages: BaseMessage[], options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
    _sleepIfRequested(): Promise<void>;
    _sleep(): Promise<void>;
    _createResponseChunk(text: string): ChatGenerationChunk;
    _currentResponse(): string;
    _incrementResponse(): void;
    withStructuredOutput<RunOutput extends Record<string, any> = Record<string, any>>(_params: StructuredOutputMethodParams<RunOutput, false> | z.ZodType<RunOutput> | Record<string, any>, config?: StructuredOutputMethodOptions<false>): Runnable<BaseLanguageModelInput, RunOutput>;
    withStructuredOutput<RunOutput extends Record<string, any> = Record<string, any>>(_params: StructuredOutputMethodParams<RunOutput, true> | z.ZodType<RunOutput> | Record<string, any>, config?: StructuredOutputMethodOptions<true>): Runnable<BaseLanguageModelInput, {
        raw: BaseMessage;
        parsed: RunOutput;
    }>;
}
export declare class FakeChatMessageHistory extends BaseChatMessageHistory {
    lc_namespace: string[];
    messages: Array<BaseMessage>;
    constructor();
    getMessages(): Promise<BaseMessage[]>;
    addMessage(message: BaseMessage): Promise<void>;
    addUserMessage(message: string): Promise<void>;
    addAIChatMessage(message: string): Promise<void>;
    clear(): Promise<void>;
}
export declare class FakeListChatMessageHistory extends BaseListChatMessageHistory {
    lc_namespace: string[];
    messages: Array<BaseMessage>;
    constructor();
    addMessage(message: BaseMessage): Promise<void>;
    getMessages(): Promise<BaseMessage[]>;
}
export declare class FakeTracer extends BaseTracer {
    name: string;
    runs: Run[];
    constructor();
    protected persistRun(run: Run): Promise<void>;
}
export interface FakeToolParams<T extends z.ZodObject<any, any, any, any> = z.ZodObject<any, any, any, any>> extends ToolParams {
    name: string;
    description: string;
    schema: T;
}
export declare class FakeTool<T extends z.ZodObject<any, any, any, any> = z.ZodObject<any, any, any, any>> extends StructuredTool<T> {
    name: string;
    description: string;
    schema: T;
    constructor(fields: FakeToolParams<T>);
    protected _call(arg: z.output<T>, _runManager?: CallbackManagerForToolRun): Promise<string>;
}
/**
 * A class that provides fake embeddings by overriding the embedDocuments
 * and embedQuery methods to return fixed values.
 */
export declare class FakeEmbeddings extends Embeddings {
    constructor(params?: EmbeddingsParams);
    /**
     * Generates fixed embeddings for a list of documents.
     * @param documents List of documents to generate embeddings for.
     * @returns A promise that resolves with a list of fixed embeddings for each document.
     */
    embedDocuments(documents: string[]): Promise<number[][]>;
    /**
     * Generates a fixed embedding for a query.
     * @param _ The query to generate an embedding for.
     * @returns A promise that resolves with a fixed embedding for the query.
     */
    embedQuery(_: string): Promise<number[]>;
}
/**
 * An interface that defines additional parameters specific to the
 * SyntheticEmbeddings class.
 */
interface SyntheticEmbeddingsParams extends EmbeddingsParams {
    vectorSize: number;
}
/**
 * A class that provides synthetic embeddings by overriding the
 * embedDocuments and embedQuery methods to generate embeddings based on
 * the input documents. The embeddings are generated by converting each
 * document into chunks, calculating a numerical value for each chunk, and
 * returning an array of these values as the embedding.
 */
export declare class SyntheticEmbeddings extends Embeddings implements SyntheticEmbeddingsParams {
    vectorSize: number;
    constructor(params?: SyntheticEmbeddingsParams);
    /**
     * Generates synthetic embeddings for a list of documents.
     * @param documents List of documents to generate embeddings for.
     * @returns A promise that resolves with a list of synthetic embeddings for each document.
     */
    embedDocuments(documents: string[]): Promise<number[][]>;
    /**
     * Generates a synthetic embedding for a document. The document is
     * converted into chunks, a numerical value is calculated for each chunk,
     * and an array of these values is returned as the embedding.
     * @param document The document to generate an embedding for.
     * @returns A promise that resolves with a synthetic embedding for the document.
     */
    embedQuery(document: string): Promise<number[]>;
}
export declare class SingleRunExtractor extends BaseTracer {
    runPromiseResolver: (run: Run) => void;
    runPromise: Promise<Run>;
    /** The name of the callback handler. */
    name: string;
    constructor();
    persistRun(run: Run): Promise<void>;
    extract(): Promise<Run>;
}
/**
 * Interface representing a vector in memory. It includes the content
 * (text), the corresponding embedding (vector), and any associated
 * metadata.
 */
interface MemoryVector {
    content: string;
    embedding: number[];
    metadata: Record<string, any>;
}
/**
 * Interface for the arguments that can be passed to the
 * `FakeVectorStore` constructor. It includes an optional `similarity`
 * function.
 */
export interface FakeVectorStoreArgs {
    similarity?: typeof cosine;
}
/**
 * Class that extends `VectorStore` to store vectors in memory. Provides
 * methods for adding documents, performing similarity searches, and
 * creating instances from texts, documents, or an existing index.
 */
export declare class FakeVectorStore extends VectorStore {
    FilterType: (doc: Document) => boolean;
    memoryVectors: MemoryVector[];
    similarity: typeof cosine;
    _vectorstoreType(): string;
    constructor(embeddings: EmbeddingsInterface, { similarity, ...rest }?: FakeVectorStoreArgs);
    /**
     * Method to add documents to the memory vector store. It extracts the
     * text from each document, generates embeddings for them, and adds the
     * resulting vectors to the store.
     * @param documents Array of `Document` instances to be added to the store.
     * @returns Promise that resolves when all documents have been added.
     */
    addDocuments(documents: Document[]): Promise<void>;
    /**
     * Method to add vectors to the memory vector store. It creates
     * `MemoryVector` instances for each vector and document pair and adds
     * them to the store.
     * @param vectors Array of vectors to be added to the store.
     * @param documents Array of `Document` instances corresponding to the vectors.
     * @returns Promise that resolves when all vectors have been added.
     */
    addVectors(vectors: number[][], documents: Document[]): Promise<void>;
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
    similaritySearchVectorWithScore(query: number[], k: number, filter?: this["FilterType"]): Promise<[Document, number][]>;
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
    static fromTexts(texts: string[], metadatas: object[] | object, embeddings: EmbeddingsInterface, dbConfig?: FakeVectorStoreArgs): Promise<FakeVectorStore>;
    /**
     * Static method to create a `FakeVectorStore` instance from an array of
     * `Document` instances. It adds the documents to the store.
     * @param docs Array of `Document` instances to be added to the store.
     * @param embeddings `Embeddings` instance used to generate embeddings for the documents.
     * @param dbConfig Optional `FakeVectorStoreArgs` to configure the `FakeVectorStore` instance.
     * @returns Promise that resolves with a new `FakeVectorStore` instance.
     */
    static fromDocuments(docs: Document[], embeddings: EmbeddingsInterface, dbConfig?: FakeVectorStoreArgs): Promise<FakeVectorStore>;
    /**
     * Static method to create a `FakeVectorStore` instance from an existing
     * index. It creates a new `FakeVectorStore` instance without adding any
     * documents or vectors.
     * @param embeddings `Embeddings` instance used to generate embeddings for the documents.
     * @param dbConfig Optional `FakeVectorStoreArgs` to configure the `FakeVectorStore` instance.
     * @returns Promise that resolves with a new `FakeVectorStore` instance.
     */
    static fromExistingIndex(embeddings: EmbeddingsInterface, dbConfig?: FakeVectorStoreArgs): Promise<FakeVectorStore>;
}
export {};
