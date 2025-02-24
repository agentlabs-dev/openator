export function splitArray(array, numberOfChunk) {
    const chunkSize = Math.ceil(array.length / numberOfChunk);
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}
//# sourceMappingURL=utils.js.map