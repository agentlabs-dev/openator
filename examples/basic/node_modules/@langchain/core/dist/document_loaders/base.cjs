"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDocumentLoader = void 0;
/**
 * Abstract class that provides a default implementation for the
 * loadAndSplit() method from the DocumentLoader interface. The load()
 * method is left abstract and needs to be implemented by subclasses.
 */
class BaseDocumentLoader {
    /**
     * @deprecated Use `this.load()` and `splitter.splitDocuments()` individually.
     * Loads the documents and splits them using a specified text splitter.
     * @param textSplitter The TextSplitter instance to use for splitting the loaded documents. Defaults to a RecursiveCharacterTextSplitter instance.
     * @returns A Promise that resolves with an array of Document instances, each split according to the provided TextSplitter.
     */
    async loadAndSplit(splitter) {
        if (splitter === undefined) {
            throw new Error("You must pass a text splitter to use this method.");
        }
        const docs = await this.load();
        return splitter.invoke(docs);
    }
}
exports.BaseDocumentLoader = BaseDocumentLoader;
