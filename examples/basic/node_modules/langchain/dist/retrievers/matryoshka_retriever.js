import { cosineSimilarity, euclideanDistance, innerProduct, } from "@langchain/core/utils/math";
import { VectorStoreRetriever, } from "@langchain/core/vectorstores";
/**
 * A retriever that uses two sets of embeddings to perform adaptive retrieval. Based
 * off of the "Matryoshka embeddings: faster OpenAI vector search using Adaptive Retrieval"
 * blog post {@link https://supabase.com/blog/matryoshka-embeddings}.
 *
 *
 * This class performs "Adaptive Retrieval" for searching text embeddings efficiently using the
 * Matryoshka Representation Learning (MRL) technique. It retrieves documents similar to a query
 * embedding in two steps:
 *
 * First-pass: Uses a lower dimensional sub-vector from the MRL embedding for an initial, fast,
 * but less accurate search.
 *
 * Second-pass: Re-ranks the top results from the first pass using the full, high-dimensional
 * embedding for higher accuracy.
 *
 *
 * This code implements MRL embeddings for efficient vector search by combining faster,
 * lower-dimensional initial search with accurate, high-dimensional re-ranking.
 */
export class MatryoshkaRetriever extends VectorStoreRetriever {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "smallK", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 50
        });
        Object.defineProperty(this, "largeK", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 8
        });
        Object.defineProperty(this, "largeEmbeddingKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "lc_large_embedding"
        });
        Object.defineProperty(this, "largeEmbeddingModel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "searchType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "cosine"
        });
        /**
         * Override the default `addDocuments` method to embed the documents twice,
         * once using the larger embeddings model, and then again using the default
         * embedding model linked to the vector store.
         *
         * @param {DocumentInterface[]} documents - An array of documents to add to the vector store.
         * @param {AddDocumentOptions} options - An optional object containing additional options for adding documents.
         * @returns {Promise<string[] | void>} A promise that resolves to an array of the document IDs that were added to the vector store.
         */
        Object.defineProperty(this, "addDocuments", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async (documents, options) => {
                // Insure documents metadata does not contain the large embedding key
                if (documents.some((doc) => this.largeEmbeddingKey in doc.metadata)) {
                    throw new Error(`All documents must not contain the large embedding key: ${this.largeEmbeddingKey} in their metadata.`);
                }
                const allDocPageContent = documents.map((doc) => doc.pageContent);
                const allDocLargeEmbeddings = await this.largeEmbeddingModel.embedDocuments(allDocPageContent);
                const newDocuments = documents.map((doc, idx) => ({
                    ...doc,
                    metadata: {
                        ...doc.metadata,
                        [this.largeEmbeddingKey]: JSON.stringify(allDocLargeEmbeddings[idx]),
                    },
                }));
                return this.vectorStore.addDocuments(newDocuments, options);
            }
        });
        this.smallK = fields.smallK ?? this.smallK;
        this.largeK = fields.largeK ?? this.largeK;
        this.largeEmbeddingKey = fields.largeEmbeddingKey ?? this.largeEmbeddingKey;
        this.largeEmbeddingModel = fields.largeEmbeddingModel;
        this.searchType = fields.searchType ?? this.searchType;
    }
    /**
     * Ranks documents based on their similarity to a query embedding using larger embeddings.
     *
     * This method takes a query embedding and a list of documents (smallResults) as input. Each document
     * in the smallResults array has previously been associated with a large embedding stored in its metadata.
     * Depending on the `searchType` (cosine, innerProduct, or euclidean), it calculates the similarity scores
     * between the query embedding and each document's large embedding. It then ranks the documents based on
     * these similarity scores, from the most similar to the least similar.
     *
     * The method returns a promise that resolves to an array of the top `largeK` documents, where `largeK`
     * is a class property defining the number of documents to return. This subset of documents is determined
     * by sorting the entire list of documents based on their similarity scores and then selecting the top
     * `largeK` documents.
     *
     * @param {number[]} embeddedQuery The embedding of the query, represented as an array of numbers.
     * @param {DocumentInterface[]} smallResults An array of documents, each with metadata that includes a large embedding for similarity comparison.
     * @returns {Promise<DocumentInterface[]>} A promise that resolves to an array of the top `largeK` ranked documents based on their similarity to the query embedding.
     */
    _rankByLargeEmbeddings(embeddedQuery, smallResults) {
        const largeEmbeddings = smallResults.map((doc) => JSON.parse(doc.metadata[this.largeEmbeddingKey]));
        let func;
        switch (this.searchType) {
            case "cosine":
                func = () => cosineSimilarity([embeddedQuery], largeEmbeddings);
                break;
            case "innerProduct":
                func = () => innerProduct([embeddedQuery], largeEmbeddings);
                break;
            case "euclidean":
                func = () => euclideanDistance([embeddedQuery], largeEmbeddings);
                break;
            default:
                throw new Error(`Unknown search type: ${this.searchType}`);
        }
        // Calculate the similarity scores between the query embedding and the large embeddings
        const [similarityScores] = func();
        // Create an array of indices from 0 to N-1, where N is the number of documents
        let indices = Array.from({ length: smallResults.length }, (_, index) => index);
        indices = indices
            .map((v, i) => [similarityScores[i], v])
            .sort(([a], [b]) => b - a)
            .slice(0, this.largeK)
            .map(([, i]) => i);
        return indices.map((i) => smallResults[i]);
    }
    async _getRelevantDocuments(query) {
        const [embeddedQuery, smallResults] = await Promise.all([
            this.largeEmbeddingModel.embedQuery(query),
            this.vectorStore.similaritySearch(query, this.smallK, this.filter),
        ]);
        return this._rankByLargeEmbeddings(embeddedQuery, smallResults);
    }
}
