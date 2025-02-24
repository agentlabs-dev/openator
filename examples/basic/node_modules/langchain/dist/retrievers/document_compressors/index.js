/**
 * Base Document Compression class. All compressors should extend this class.
 */
export class BaseDocumentCompressor {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static isBaseDocumentCompressor(x) {
        return x?.compressDocuments !== undefined;
    }
}
/**
 * Document compressor that uses a pipeline of Transformers.
 * @example
 * ```typescript
 * const compressorPipeline = new DocumentCompressorPipeline({
 *   transformers: [
 *     new RecursiveCharacterTextSplitter({
 *       chunkSize: 200,
 *       chunkOverlap: 0,
 *     }),
 *     new EmbeddingsFilter({
 *       embeddings: new OpenAIEmbeddings(),
 *       similarityThreshold: 0.8,
 *       k: 5,
 *     }),
 *   ],
 * });
 * const retriever = new ContextualCompressionRetriever({
 *   baseCompressor: compressorPipeline,
 *   baseRetriever: new TavilySearchAPIRetriever({
 *     includeRawContent: true,
 *   }),
 * });
 * const retrievedDocs = await retriever.getRelevantDocuments(
 *   "What did the speaker say about Justice Breyer in the 2022 State of the Union?",
 * );
 * console.log({ retrievedDocs });
 * ```
 */
export class DocumentCompressorPipeline extends BaseDocumentCompressor {
    constructor(fields) {
        super();
        Object.defineProperty(this, "transformers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.transformers = fields.transformers;
    }
    async compressDocuments(documents, query, callbacks) {
        let transformedDocuments = documents;
        for (const transformer of this.transformers) {
            if (BaseDocumentCompressor.isBaseDocumentCompressor(transformer)) {
                transformedDocuments = await transformer.compressDocuments(transformedDocuments, query, callbacks);
            }
            else {
                transformedDocuments = await transformer.transformDocuments(transformedDocuments);
            }
        }
        return transformedDocuments;
    }
}
