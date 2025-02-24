/**
 * Interface for interacting with a document.
 */
export class Document {
    constructor(fields) {
        Object.defineProperty(this, "pageContent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metadata", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // The ID field is optional at the moment.
        // It will likely become required in a future major release after
        // it has been adopted by enough vectorstore implementations.
        /**
         * An optional identifier for the document.
         *
         * Ideally this should be unique across the document collection and formatted
         * as a UUID, but this will not be enforced.
         */
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.pageContent =
            fields.pageContent !== undefined ? fields.pageContent.toString() : "";
        this.metadata = fields.metadata ?? {};
        this.id = fields.id;
    }
}
