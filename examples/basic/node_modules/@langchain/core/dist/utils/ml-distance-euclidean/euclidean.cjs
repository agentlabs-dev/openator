"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.euclidean = exports.squaredEuclidean = void 0;
function squaredEuclidean(p, q) {
    let d = 0;
    for (let i = 0; i < p.length; i++) {
        d += (p[i] - q[i]) * (p[i] - q[i]);
    }
    return d;
}
exports.squaredEuclidean = squaredEuclidean;
function euclidean(p, q) {
    return Math.sqrt(squaredEuclidean(p, q));
}
exports.euclidean = euclidean;
