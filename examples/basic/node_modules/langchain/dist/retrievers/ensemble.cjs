"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnsembleRetriever = void 0;
const retrievers_1 = require("@langchain/core/retrievers");
/**
 * Ensemble retriever that aggregates and orders the results of
 * multiple retrievers by using weighted Reciprocal Rank Fusion.
 */
class EnsembleRetriever extends retrievers_1.BaseRetriever {
    static lc_name() {
        return "EnsembleRetriever";
    }
    constructor(args) {
        super(args);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "retrievers", "ensemble_retriever"]
        });
        Object.defineProperty(this, "retrievers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "weights", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "c", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 60
        });
        this.retrievers = args.retrievers;
        this.weights =
            args.weights ||
                new Array(args.retrievers.length).fill(1 / args.retrievers.length);
        this.c = args.c || 60;
    }
    async _getRelevantDocuments(query, runManager) {
        return this._rankFusion(query, runManager);
    }
    async _rankFusion(query, runManager) {
        const retrieverDocs = await Promise.all(this.retrievers.map((retriever, i) => retriever.invoke(query, {
            callbacks: runManager?.getChild(`retriever_${i + 1}`),
        })));
        const fusedDocs = await this._weightedReciprocalRank(retrieverDocs);
        return fusedDocs;
    }
    async _weightedReciprocalRank(docList) {
        if (docList.length !== this.weights.length) {
            throw new Error("Number of retrieved document lists must be equal to the number of weights.");
        }
        const rrfScoreDict = docList.reduce((rffScore, retrieverDoc, idx) => {
            let rank = 1;
            const weight = this.weights[idx];
            while (rank <= retrieverDoc.length) {
                const { pageContent } = retrieverDoc[rank - 1];
                if (!rffScore[pageContent]) {
                    // eslint-disable-next-line no-param-reassign
                    rffScore[pageContent] = 0;
                }
                // eslint-disable-next-line no-param-reassign
                rffScore[pageContent] += weight / (rank + this.c);
                rank += 1;
            }
            return rffScore;
        }, {});
        const uniqueDocs = this._uniqueUnion(docList.flat());
        const sortedDocs = Array.from(uniqueDocs).sort((a, b) => rrfScoreDict[b.pageContent] - rrfScoreDict[a.pageContent]);
        return sortedDocs;
    }
    _uniqueUnion(documents) {
        const documentSet = new Set();
        const result = [];
        for (const doc of documents) {
            const key = doc.pageContent;
            if (!documentSet.has(key)) {
                documentSet.add(key);
                result.push(doc);
            }
        }
        return result;
    }
}
exports.EnsembleRetriever = EnsembleRetriever;
