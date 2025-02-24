"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairwiseEmbeddingDistanceEvalChain = exports.EmbeddingDistanceEvalChain = exports.computeEvaluationScore = exports.getDistanceCalculationFunction = void 0;
const openai_1 = require("@langchain/openai");
const base_js_1 = require("../base.cjs");
const similarities_js_1 = require("../../util/ml-distance/similarities.cjs");
const distances_js_1 = require("../../util/ml-distance/distances.cjs");
const euclidean_js_1 = require("../../util/ml-distance-euclidean/euclidean.cjs");
/**
 * Get the distance function for the given distance type.
 * @param distance The distance type.
 * @return The distance function.
 */
function getDistanceCalculationFunction(distanceType) {
    const distanceFunctions = {
        cosine: (X, Y) => 1.0 - (0, similarities_js_1.cosine)(X, Y),
        euclidean: euclidean_js_1.euclidean,
        manhattan: distances_js_1.manhattan,
        chebyshev: distances_js_1.chebyshev,
    };
    return distanceFunctions[distanceType];
}
exports.getDistanceCalculationFunction = getDistanceCalculationFunction;
/**
 * Compute the score based on the distance metric.
 * @param vectors The input vectors.
 * @param distanceMetric The distance metric.
 * @return The computed score.
 */
function computeEvaluationScore(vectors, distanceMetric) {
    const metricFunction = getDistanceCalculationFunction(distanceMetric);
    return metricFunction(vectors[0], vectors[1]);
}
exports.computeEvaluationScore = computeEvaluationScore;
/**
 * Use embedding distances to score semantic difference between
 * a prediction and reference.
 */
class EmbeddingDistanceEvalChain extends base_js_1.StringEvaluator {
    constructor(fields) {
        super();
        Object.defineProperty(this, "requiresReference", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "requiresInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "outputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "score"
        });
        Object.defineProperty(this, "embedding", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "distanceMetric", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "cosine"
        });
        this.embedding = fields?.embedding || new openai_1.OpenAIEmbeddings();
        this.distanceMetric = fields?.distanceMetric || "cosine";
    }
    _chainType() {
        return `embedding_${this.distanceMetric}_distance`;
    }
    async _evaluateStrings(args, config) {
        const result = await this.call(args, config);
        return { [this.outputKey]: result[this.outputKey] };
    }
    get inputKeys() {
        return ["reference", "prediction"];
    }
    get outputKeys() {
        return [this.outputKey];
    }
    async _call(values, _runManager) {
        const { prediction, reference } = values;
        if (!this.embedding)
            throw new Error("Embedding is undefined");
        const vectors = await this.embedding.embedDocuments([
            prediction,
            reference,
        ]);
        const score = computeEvaluationScore(vectors, this.distanceMetric);
        return { [this.outputKey]: score };
    }
}
exports.EmbeddingDistanceEvalChain = EmbeddingDistanceEvalChain;
/**
 * Use embedding distances to score semantic difference between two predictions.
 */
class PairwiseEmbeddingDistanceEvalChain extends base_js_1.PairwiseStringEvaluator {
    constructor(fields) {
        super();
        Object.defineProperty(this, "requiresReference", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "requiresInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "outputKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "score"
        });
        Object.defineProperty(this, "embedding", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "distanceMetric", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "cosine"
        });
        this.embedding = fields?.embedding || new openai_1.OpenAIEmbeddings();
        this.distanceMetric = fields?.distanceMetric || "cosine";
    }
    _chainType() {
        return `pairwise_embedding_${this.distanceMetric}_distance`;
    }
    async _evaluateStringPairs(args, config) {
        const result = await this.call(args, config);
        return { [this.outputKey]: result[this.outputKey] };
    }
    get inputKeys() {
        return ["prediction", "predictionB"];
    }
    get outputKeys() {
        return [this.outputKey];
    }
    async _call(values, _runManager) {
        const { prediction, predictionB } = values;
        if (!this.embedding)
            throw new Error("Embedding is undefined");
        const vectors = await this.embedding.embedDocuments([
            prediction,
            predictionB,
        ]);
        const score = computeEvaluationScore(vectors, this.distanceMetric);
        return { [this.outputKey]: score };
    }
}
exports.PairwiseEmbeddingDistanceEvalChain = PairwiseEmbeddingDistanceEvalChain;
