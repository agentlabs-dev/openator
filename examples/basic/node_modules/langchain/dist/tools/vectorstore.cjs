"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorStoreQATool = void 0;
const tools_1 = require("@langchain/core/tools");
const vector_db_qa_js_1 = require("../chains/vector_db_qa.cjs");
/**
 * A tool for the VectorDBQA chain to interact with a Vector Store. It is
 * used to answer questions about a specific topic. The input to this tool
 * should be a fully formed question.
 */
class VectorStoreQATool extends tools_1.Tool {
    static lc_name() {
        return "VectorStoreQATool";
    }
    constructor(name, description, fields) {
        super(...arguments);
        Object.defineProperty(this, "vectorStore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "llm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
        Object.defineProperty(this, "chain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = name;
        this.description = description;
        this.vectorStore = fields.vectorStore;
        this.llm = fields.llm;
        this.chain = vector_db_qa_js_1.VectorDBQAChain.fromLLM(this.llm, this.vectorStore);
    }
    /**
     * Returns a string that describes what the tool does.
     * @param name The name of the tool.
     * @param description A description of what the tool does.
     * @returns A string that describes what the tool does.
     */
    static getDescription(name, description) {
        return `Useful for when you need to answer questions about ${name}. Whenever you need information about ${description} you should ALWAYS use this. Input should be a fully formed question.`;
    }
    /** @ignore */
    async _call(input) {
        return this.chain.run(input);
    }
}
exports.VectorStoreQATool = VectorStoreQATool;
