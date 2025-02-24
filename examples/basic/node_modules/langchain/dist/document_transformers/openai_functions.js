import { zodToJsonSchema, } from "zod-to-json-schema";
import { Document, MappingDocumentTransformer, } from "@langchain/core/documents";
import { ChatOpenAI } from "@langchain/openai";
import { createTaggingChain, } from "../chains/openai_functions/index.js";
/**
 * A transformer that tags metadata to a document using a tagging chain.
 */
export class MetadataTagger extends MappingDocumentTransformer {
    static lc_name() {
        return "MetadataTagger";
    }
    constructor(fields) {
        super();
        Object.defineProperty(this, "taggingChain", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.taggingChain = fields.taggingChain;
        if (this.taggingChain.inputKeys.length !== 1) {
            throw new Error("Invalid input chain. The input chain must have exactly one input.");
        }
        if (this.taggingChain.outputKeys.length !== 1) {
            throw new Error("Invalid input chain. The input chain must have exactly one output.");
        }
    }
    async _transformDocument(document) {
        const taggingChainResponse = await this.taggingChain.call({
            [this.taggingChain.inputKeys[0]]: document.pageContent,
        });
        const extractedMetadata = taggingChainResponse[this.taggingChain.outputKeys[0]];
        return new Document({
            pageContent: document.pageContent,
            metadata: { ...extractedMetadata, ...document.metadata },
        });
    }
}
export function createMetadataTagger(schema, options) {
    const { llm = new ChatOpenAI({ modelName: "gpt-3.5-turbo-0613" }), ...rest } = options;
    const taggingChain = createTaggingChain(schema, llm, rest);
    return new MetadataTagger({ taggingChain });
}
export function createMetadataTaggerFromZod(schema, options) {
    return createMetadataTagger(zodToJsonSchema(schema), options);
}
