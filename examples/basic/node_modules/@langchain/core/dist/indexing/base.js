import { v5 as uuidv5 } from "uuid";
import { UUIDV5_NAMESPACE } from "./record_manager.js";
import { insecureHash } from "../utils/hash.js";
import { Document } from "../documents/document.js";
/**
 * HashedDocument is a Document with hashes calculated.
 * Hashes are calculated based on page content and metadata.
 * It is used for indexing.
 */
export class _HashedDocument {
    constructor(fields) {
        Object.defineProperty(this, "uid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hash_", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "contentHash", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metadataHash", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
        this.uid = fields.uid;
        this.pageContent = fields.pageContent;
        this.metadata = fields.metadata;
    }
    calculateHashes() {
        const forbiddenKeys = ["hash_", "content_hash", "metadata_hash"];
        for (const key of forbiddenKeys) {
            if (key in this.metadata) {
                throw new Error(`Metadata cannot contain key ${key} as it is reserved for internal use. Restricted keys: [${forbiddenKeys.join(", ")}]`);
            }
        }
        const contentHash = this._hashStringToUUID(this.pageContent);
        try {
            const metadataHash = this._hashNestedDictToUUID(this.metadata);
            this.contentHash = contentHash;
            this.metadataHash = metadataHash;
        }
        catch (e) {
            throw new Error(`Failed to hash metadata: ${e}. Please use a dict that can be serialized using json.`);
        }
        this.hash_ = this._hashStringToUUID(this.contentHash + this.metadataHash);
        if (!this.uid) {
            this.uid = this.hash_;
        }
    }
    toDocument() {
        return new Document({
            pageContent: this.pageContent,
            metadata: this.metadata,
        });
    }
    static fromDocument(document, uid) {
        const doc = new this({
            pageContent: document.pageContent,
            metadata: document.metadata,
            uid: uid || document.uid,
        });
        doc.calculateHashes();
        return doc;
    }
    _hashStringToUUID(inputString) {
        const hash_value = insecureHash(inputString);
        return uuidv5(hash_value, UUIDV5_NAMESPACE);
    }
    _hashNestedDictToUUID(data) {
        const serialized_data = JSON.stringify(data, Object.keys(data).sort());
        const hash_value = insecureHash(serialized_data);
        return uuidv5(hash_value, UUIDV5_NAMESPACE);
    }
}
export function _batch(size, iterable) {
    const batches = [];
    let currentBatch = [];
    iterable.forEach((item) => {
        currentBatch.push(item);
        if (currentBatch.length >= size) {
            batches.push(currentBatch);
            currentBatch = [];
        }
    });
    if (currentBatch.length > 0) {
        batches.push(currentBatch);
    }
    return batches;
}
export function _deduplicateInOrder(hashedDocuments) {
    const seen = new Set();
    const deduplicated = [];
    for (const hashedDoc of hashedDocuments) {
        if (!hashedDoc.hash_) {
            throw new Error("Hashed document does not have a hash");
        }
        if (!seen.has(hashedDoc.hash_)) {
            seen.add(hashedDoc.hash_);
            deduplicated.push(hashedDoc);
        }
    }
    return deduplicated;
}
export function _getSourceIdAssigner(sourceIdKey) {
    if (sourceIdKey === null) {
        return (_doc) => null;
    }
    else if (typeof sourceIdKey === "string") {
        return (doc) => doc.metadata[sourceIdKey];
    }
    else if (typeof sourceIdKey === "function") {
        return sourceIdKey;
    }
    else {
        throw new Error(`sourceIdKey should be null, a string or a function, got ${typeof sourceIdKey}`);
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const _isBaseDocumentLoader = (arg) => {
    if ("load" in arg &&
        typeof arg.load === "function" &&
        "loadAndSplit" in arg &&
        typeof arg.loadAndSplit === "function") {
        return true;
    }
    return false;
};
/**
 * Index data from the doc source into the vector store.
 *
 * Indexing functionality uses a manager to keep track of which documents
 * are in the vector store.
 *
 * This allows us to keep track of which documents were updated, and which
 * documents were deleted, which documents should be skipped.
 *
 * For the time being, documents are indexed using their hashes, and users
 *  are not able to specify the uid of the document.
 *
 * @param {IndexArgs} args
 * @param {BaseDocumentLoader | DocumentInterface[]} args.docsSource The source of documents to index. Can be a DocumentLoader or a list of Documents.
 * @param {RecordManagerInterface} args.recordManager The record manager to use for keeping track of indexed documents.
 * @param {VectorStore} args.vectorStore The vector store to use for storing the documents.
 * @param {IndexOptions | undefined} args.options Options for indexing.
 * @returns {Promise<IndexingResult>}
 */
export async function index(args) {
    const { docsSource, recordManager, vectorStore, options } = args;
    const { batchSize = 100, cleanup, sourceIdKey, cleanupBatchSize = 1000, forceUpdate = false, } = options ?? {};
    if (cleanup === "incremental" && !sourceIdKey) {
        throw new Error("sourceIdKey is required when cleanup mode is incremental. Please provide through 'options.sourceIdKey'.");
    }
    const docs = _isBaseDocumentLoader(docsSource)
        ? await docsSource.load()
        : docsSource;
    const sourceIdAssigner = _getSourceIdAssigner(sourceIdKey ?? null);
    const indexStartDt = await recordManager.getTime();
    let numAdded = 0;
    let numDeleted = 0;
    let numUpdated = 0;
    let numSkipped = 0;
    const batches = _batch(batchSize ?? 100, docs);
    for (const batch of batches) {
        const hashedDocs = _deduplicateInOrder(batch.map((doc) => _HashedDocument.fromDocument(doc)));
        const sourceIds = hashedDocs.map((doc) => sourceIdAssigner(doc));
        if (cleanup === "incremental") {
            hashedDocs.forEach((_hashedDoc, index) => {
                const source = sourceIds[index];
                if (source === null) {
                    throw new Error("sourceIdKey must be provided when cleanup is incremental");
                }
            });
        }
        const batchExists = await recordManager.exists(hashedDocs.map((doc) => doc.uid));
        const uids = [];
        const docsToIndex = [];
        const docsToUpdate = [];
        const seenDocs = new Set();
        hashedDocs.forEach((hashedDoc, i) => {
            const docExists = batchExists[i];
            if (docExists) {
                if (forceUpdate) {
                    seenDocs.add(hashedDoc.uid);
                }
                else {
                    docsToUpdate.push(hashedDoc.uid);
                    return;
                }
            }
            uids.push(hashedDoc.uid);
            docsToIndex.push(hashedDoc.toDocument());
        });
        if (docsToUpdate.length > 0) {
            await recordManager.update(docsToUpdate, { timeAtLeast: indexStartDt });
            numSkipped += docsToUpdate.length;
        }
        if (docsToIndex.length > 0) {
            await vectorStore.addDocuments(docsToIndex, { ids: uids });
            numAdded += docsToIndex.length - seenDocs.size;
            numUpdated += seenDocs.size;
        }
        await recordManager.update(hashedDocs.map((doc) => doc.uid), { timeAtLeast: indexStartDt, groupIds: sourceIds });
        if (cleanup === "incremental") {
            sourceIds.forEach((sourceId) => {
                if (!sourceId)
                    throw new Error("Source id cannot be null");
            });
            const uidsToDelete = await recordManager.listKeys({
                before: indexStartDt,
                groupIds: sourceIds,
            });
            await vectorStore.delete({ ids: uidsToDelete });
            await recordManager.deleteKeys(uidsToDelete);
            numDeleted += uidsToDelete.length;
        }
    }
    if (cleanup === "full") {
        let uidsToDelete = await recordManager.listKeys({
            before: indexStartDt,
            limit: cleanupBatchSize,
        });
        while (uidsToDelete.length > 0) {
            await vectorStore.delete({ ids: uidsToDelete });
            await recordManager.deleteKeys(uidsToDelete);
            numDeleted += uidsToDelete.length;
            uidsToDelete = await recordManager.listKeys({
                before: indexStartDt,
                limit: cleanupBatchSize,
            });
        }
    }
    return {
        numAdded,
        numDeleted,
        numUpdated,
        numSkipped,
    };
}
