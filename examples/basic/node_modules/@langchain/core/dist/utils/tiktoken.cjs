"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodingForModel = exports.getEncoding = void 0;
const lite_1 = require("js-tiktoken/lite");
const async_caller_js_1 = require("./async_caller.cjs");
const cache = {};
const caller = /* #__PURE__ */ new async_caller_js_1.AsyncCaller({});
async function getEncoding(encoding) {
    if (!(encoding in cache)) {
        cache[encoding] = caller
            .fetch(`https://tiktoken.pages.dev/js/${encoding}.json`)
            .then((res) => res.json())
            .then((data) => new lite_1.Tiktoken(data))
            .catch((e) => {
            delete cache[encoding];
            throw e;
        });
    }
    return await cache[encoding];
}
exports.getEncoding = getEncoding;
async function encodingForModel(model) {
    return getEncoding((0, lite_1.getEncodingNameForModel)(model));
}
exports.encodingForModel = encodingForModel;
