"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntityStore = void 0;
const serializable_1 = require("@langchain/core/load/serializable");
/**
 * Base class for all entity stores. All entity stores should extend this
 * class.
 */
class BaseEntityStore extends serializable_1.Serializable {
}
exports.BaseEntityStore = BaseEntityStore;
