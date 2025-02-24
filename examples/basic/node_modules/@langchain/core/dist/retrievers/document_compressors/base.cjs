"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDocumentCompressor = void 0;
/**
 * Base Document Compression class. All compressors should extend this class.
 */
class BaseDocumentCompressor {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static isBaseDocumentCompressor(x) {
        return x?.compressDocuments !== undefined;
    }
}
exports.BaseDocumentCompressor = BaseDocumentCompressor;
