"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToHttpEventStream = void 0;
const stream_js_1 = require("../utils/stream.cjs");
function convertToHttpEventStream(stream) {
    const encoder = new TextEncoder();
    const finalStream = new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                controller.enqueue(encoder.encode(`event: data\ndata: ${JSON.stringify(chunk)}\n\n`));
            }
            controller.enqueue(encoder.encode("event: end\n\n"));
            controller.close();
        },
    });
    return stream_js_1.IterableReadableStream.fromReadableStream(finalStream);
}
exports.convertToHttpEventStream = convertToHttpEventStream;
