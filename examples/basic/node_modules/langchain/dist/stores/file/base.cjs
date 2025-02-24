"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseFileStore = void 0;
const serializable_1 = require("@langchain/core/load/serializable");
/**
 * Base class for all file stores. All file stores should extend this
 * class.
 */
class BaseFileStore extends serializable_1.Serializable {
}
exports.BaseFileStore = BaseFileStore;
