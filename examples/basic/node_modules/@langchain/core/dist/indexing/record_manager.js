import { Serializable } from "../load/serializable.js";
// Arbitrary value, used for generating namespaced UUIDs.
export const UUIDV5_NAMESPACE = "10f90ea3-90a4-4962-bf75-83a0f3c1c62a";
export class RecordManager extends Serializable {
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
