"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordManager = exports.UUIDV5_NAMESPACE = void 0;
const serializable_js_1 = require("../load/serializable.cjs");
// Arbitrary value, used for generating namespaced UUIDs.
exports.UUIDV5_NAMESPACE = "10f90ea3-90a4-4962-bf75-83a0f3c1c62a";
class RecordManager extends serializable_js_1.Serializable {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "recordmanagers"]
        });
    }
}
exports.RecordManager = RecordManager;
