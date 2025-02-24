import { VectorStoreRetriever, } from "@langchain/core/vectorstores";
export class ScoreThresholdRetriever extends VectorStoreRetriever {
    constructor(input) {
        super(input);
        Object.defineProperty(this, "minSimilarityScore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "kIncrement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 10
        });
        Object.defineProperty(this, "maxK", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        });
        this.maxK = input.maxK ?? this.maxK;
        this.minSimilarityScore =
            input.minSimilarityScore ?? this.minSimilarityScore;
        this.kIncrement = input.kIncrement ?? this.kIncrement;
    }
    async getRelevantDocuments(query) {
        let currentK = 0;
        let filteredResults = [];
        do {
            currentK += this.kIncrement;
            const results = await this.vectorStore.similaritySearchWithScore(query, currentK, this.filter);
            filteredResults = results.filter(([, score]) => score >= this.minSimilarityScore);
        } while (filteredResults.length >= currentK && currentK < this.maxK);
        return filteredResults.map((documents) => documents[0]).slice(0, this.maxK);
    }
    static fromVectorStore(vectorStore, options) {
        return new this({ ...options, vectorStore });
    }
}
