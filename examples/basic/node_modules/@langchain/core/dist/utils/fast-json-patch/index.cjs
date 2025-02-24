"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unescapePathComponent = exports.escapePathComponent = exports.deepClone = exports.JsonPatchError = void 0;
__exportStar(require("./src/core.cjs"), exports);
__exportStar(require("./src/duplex.cjs"), exports);
var helpers_js_1 = require("./src/helpers.cjs");
Object.defineProperty(exports, "JsonPatchError", { enumerable: true, get: function () { return helpers_js_1.PatchError; } });
Object.defineProperty(exports, "deepClone", { enumerable: true, get: function () { return helpers_js_1._deepClone; } });
Object.defineProperty(exports, "escapePathComponent", { enumerable: true, get: function () { return helpers_js_1.escapePathComponent; } });
Object.defineProperty(exports, "unescapePathComponent", { enumerable: true, get: function () { return helpers_js_1.unescapePathComponent; } });
/**
 * Default export for backwards compat
 */
const core = __importStar(require("./src/core.cjs"));
const helpers_js_2 = require("./src/helpers.cjs");
exports.default = {
    ...core,
    // ...duplex,
    JsonPatchError: helpers_js_2.PatchError,
    deepClone: helpers_js_2._deepClone,
    escapePathComponent: helpers_js_2.escapePathComponent,
    unescapePathComponent: helpers_js_2.unescapePathComponent,
};
