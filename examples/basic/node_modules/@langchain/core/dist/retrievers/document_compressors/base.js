/**
 * Base Document Compression class. All compressors should extend this class.
 */
export class BaseDocumentCompressor {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static isBaseDocumentCompressor(x) {
        return x?.compressDocuments !== undefined;
    }
}
