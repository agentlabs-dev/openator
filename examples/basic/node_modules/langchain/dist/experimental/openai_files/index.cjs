"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIFiles = void 0;
const openai_1 = require("@langchain/openai");
const serializable_1 = require("@langchain/core/load/serializable");
class OpenAIFiles extends serializable_1.Serializable {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "experimental"]
        });
        Object.defineProperty(this, "oaiClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.oaiClient = fields?.client ?? new openai_1.OpenAIClient(fields?.clientOptions);
    }
    /**
     * Upload file
     * Upload a file that can be used across various endpoints. The size of all the files uploaded by one organization can be up to 100 GB.
     *
     * @note The size of individual files can be a maximum of 512 MB. See the Assistants Tools guide to learn more about the types of files supported. The Fine-tuning API only supports .jsonl files.
     *
     * @link {https://platform.openai.com/docs/api-reference/files/create}
     * @param {OpenAIClient.FileCreateParams['file']} file
     * @param {OpenAIClient.FileCreateParams['purpose']} purpose
     * @param {OpenAIClient.RequestOptions | undefined} options
     * @returns {Promise<OpenAIClient.Files.FileObject>}
     */
    async createFile({ file, purpose, options, }) {
        return this.oaiClient.files.create({ file, purpose }, options);
    }
    /**
     * Delete a file.
     *
     * @link {https://platform.openai.com/docs/api-reference/files/delete}
     * @param {string} fileId
     * @param {OpenAIClient.RequestOptions | undefined} options
     * @returns {Promise<OpenAIClient.Files.FileDeleted>}
     */
    async deleteFile({ fileId, options, }) {
        return this.oaiClient.files.del(fileId, options);
    }
    /**
     * List files
     * Returns a list of files that belong to the user's organization.
     *
     * @link {https://platform.openai.com/docs/api-reference/files/list}
     * @param {OpenAIClient.Files.FileListParams | undefined} query
     * @param {OpenAIClient.RequestOptions | undefined} options
     * @returns {Promise<OpenAIClient.Files.FileObjectsPage>}
     */
    async listFiles(props) {
        return this.oaiClient.files.list(props?.query, props?.options);
    }
    /**
     * Retrieve file
     * Returns information about a specific file.
     *
     * @link {https://platform.openai.com/docs/api-reference/files/retrieve}
     * @param {string} fileId
     * @param {OpenAIClient.RequestOptions | undefined} options
     * @returns {Promise<OpenAIClient.Files.FileObject>}
     */
    async retrieveFile({ fileId, options, }) {
        return this.oaiClient.files.retrieve(fileId, options);
    }
    /**
     * Retrieve file content
     * Returns the contents of the specified file.
     *
     * @note You can't retrieve the contents of a file that was uploaded with the "purpose": "assistants" API.
     *
     * @link {https://platform.openai.com/docs/api-reference/files/retrieve-contents}
     * @param {string} fileId
     * @param {OpenAIClient.RequestOptions | undefined} options
     * @returns {Promise<string>}
     */
    async retrieveFileContent({ fileId, options, }) {
        return this.oaiClient.files.retrieveContent(fileId, options);
    }
}
exports.OpenAIFiles = OpenAIFiles;
