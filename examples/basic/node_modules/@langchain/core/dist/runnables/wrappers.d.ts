import { IterableReadableStream } from "../utils/stream.js";
export declare function convertToHttpEventStream(stream: AsyncGenerator): IterableReadableStream<Uint8Array>;
