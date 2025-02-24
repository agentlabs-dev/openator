import { BaseChain } from "./base.js";
import { loadQAStuffChain, } from "./question_answering/load.js";
/**
 * @deprecated This class will be removed in 1.0.0. See below for an example implementation using
 * `createRetrievalChain`:
 * Class representing a chain for performing question-answering tasks with
 * a retrieval component.
 * @example
 * ```typescript
 * import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
 * import { ChatPromptTemplate } from "@langchain/core/prompts";
 * import { createRetrievalChain } from "langchain/chains/retrieval";
 * import { MemoryVectorStore } from "langchain/vectorstores/memory";
 *
 * const documents = [...your documents here];
 * const embeddings = ...your embeddings model;
 * const llm = ...your LLM model;
 *
 * const vectorstore = await MemoryVectorStore.fromDocuments(
 *   documents,
 *   embeddings
 * );
 * const prompt = ChatPromptTemplate.fromTemplate(`Answer the user's question: {input} based on the following context {context}`);
 *
 * const combineDocsChain = await createStuffDocumentsChain({
 *   llm,
 *   prompt,
 * });
 * const retriever = vectorstore.asRetriever();
 *
 * const retrievalChain = await createRetrievalChain({
 *   combineDocsChain,
 *   retriever,
 * });
 * ```
 */
export class RetrievalQAChain extends BaseChain {
    static lc_name() {
        return "RetrievalQAChain";
    }
    get inputKeys() {
        return [this.inputKey];
    }
    get outputKeys() {
        return this.combineDocumentsChain.outputKeys.concat(this.returnSourceDocuments ? ["sourceDocuments"] : []);
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "inputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "query"
        });
        Object.defineProperty(this, "retriever", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "combineDocumentsChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "returnSourceDocuments", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.retriever = fields.retriever;
        this.combineDocumentsChain = fields.combineDocumentsChain;
        this.inputKey = fields.inputKey ?? this.inputKey;
        this.returnSourceDocuments =
            fields.returnSourceDocuments ?? this.returnSourceDocuments;
    }
    /** @ignore */
    async _call(values, runManager) {
        if (!(this.inputKey in values)) {
            throw new Error(`Question key "${this.inputKey}" not found.`);
        }
        const question = values[this.inputKey];
        const docs = await this.retriever.getRelevantDocuments(question, runManager?.getChild("retriever"));
        const inputs = { question, input_documents: docs, ...values };
        const result = await this.combineDocumentsChain.call(inputs, runManager?.getChild("combine_documents"));
        if (this.returnSourceDocuments) {
            return {
                ...result,
                sourceDocuments: docs,
            };
        }
        return result;
    }
    _chainType() {
        return "retrieval_qa";
    }
    static async deserialize(_data, _values) {
        throw new Error("Not implemented");
    }
    serialize() {
        throw new Error("Not implemented");
    }
    /**
     * Creates a new instance of RetrievalQAChain using a BaseLanguageModel
     * and a BaseRetriever.
     * @param llm The BaseLanguageModel used to generate a new question.
     * @param retriever The BaseRetriever used to retrieve relevant documents.
     * @param options Optional parameters for the RetrievalQAChain.
     * @returns A new instance of RetrievalQAChain.
     */
    static fromLLM(llm, retriever, options) {
        const qaChain = loadQAStuffChain(llm, {
            prompt: options?.prompt,
        });
        return new this({
            ...options,
            retriever,
            combineDocumentsChain: qaChain,
        });
    }
}
