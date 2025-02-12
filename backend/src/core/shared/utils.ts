export function splitArray<T>(array: T[], numberOfChunk: number): T[][] {
  const chunkSize = Math.ceil(array.length / numberOfChunk);
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}
