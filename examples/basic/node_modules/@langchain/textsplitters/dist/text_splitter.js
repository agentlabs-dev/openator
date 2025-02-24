import { Document, BaseDocumentTransformer } from "@langchain/core/documents";
import { getEncoding } from "@langchain/core/utils/tiktoken";
export class TextSplitter extends BaseDocumentTransformer {
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "document_transformers", "text_splitters"]
        });
        Object.defineProperty(this, "chunkSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1000
        });
        Object.defineProperty(this, "chunkOverlap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 200
        });
        Object.defineProperty(this, "keepSeparator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "lengthFunction", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.chunkSize = fields?.chunkSize ?? this.chunkSize;
        this.chunkOverlap = fields?.chunkOverlap ?? this.chunkOverlap;
        this.keepSeparator = fields?.keepSeparator ?? this.keepSeparator;
        this.lengthFunction =
            fields?.lengthFunction ?? ((text) => text.length);
        if (this.chunkOverlap >= this.chunkSize) {
            throw new Error("Cannot have chunkOverlap >= chunkSize");
        }
    }
    async transformDocuments(documents, chunkHeaderOptions = {}) {
        return this.splitDocuments(documents, chunkHeaderOptions);
    }
    splitOnSeparator(text, separator) {
        let splits;
        if (separator) {
            if (this.keepSeparator) {
                const regexEscapedSeparator = separator.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
                splits = text.split(new RegExp(`(?=${regexEscapedSeparator})`));
            }
            else {
                splits = text.split(separator);
            }
        }
        else {
            splits = text.split("");
        }
        return splits.filter((s) => s !== "");
    }
    async createDocuments(texts, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadatas = [], chunkHeaderOptions = {}) {
        // if no metadata is provided, we create an empty one for each text
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const _metadatas = metadatas.length > 0
            ? metadatas
            : [...Array(texts.length)].map(() => ({}));
        const { chunkHeader = "", chunkOverlapHeader = "(cont'd) ", appendChunkOverlapHeader = false, } = chunkHeaderOptions;
        const documents = new Array();
        for (let i = 0; i < texts.length; i += 1) {
            const text = texts[i];
            let lineCounterIndex = 1;
            let prevChunk = null;
            let indexPrevChunk = -1;
            for (const chunk of await this.splitText(text)) {
                let pageContent = chunkHeader;
                // we need to count the \n that are in the text before getting removed by the splitting
                const indexChunk = text.indexOf(chunk, indexPrevChunk + 1);
                if (prevChunk === null) {
                    const newLinesBeforeFirstChunk = this.numberOfNewLines(text, 0, indexChunk);
                    lineCounterIndex += newLinesBeforeFirstChunk;
                }
                else {
                    const indexEndPrevChunk = indexPrevChunk + (await this.lengthFunction(prevChunk));
                    if (indexEndPrevChunk < indexChunk) {
                        const numberOfIntermediateNewLines = this.numberOfNewLines(text, indexEndPrevChunk, indexChunk);
                        lineCounterIndex += numberOfIntermediateNewLines;
                    }
                    else if (indexEndPrevChunk > indexChunk) {
                        const numberOfIntermediateNewLines = this.numberOfNewLines(text, indexChunk, indexEndPrevChunk);
                        lineCounterIndex -= numberOfIntermediateNewLines;
                    }
                    if (appendChunkOverlapHeader) {
                        pageContent += chunkOverlapHeader;
                    }
                }
                const newLinesCount = this.numberOfNewLines(chunk);
                const loc = _metadatas[i].loc && typeof _metadatas[i].loc === "object"
                    ? { ..._metadatas[i].loc }
                    : {};
                loc.lines = {
                    from: lineCounterIndex,
                    to: lineCounterIndex + newLinesCount,
                };
                const metadataWithLinesNumber = {
                    ..._metadatas[i],
                    loc,
                };
                pageContent += chunk;
                documents.push(new Document({
                    pageContent,
                    metadata: metadataWithLinesNumber,
                }));
                lineCounterIndex += newLinesCount;
                prevChunk = chunk;
                indexPrevChunk = indexChunk;
            }
        }
        return documents;
    }
    numberOfNewLines(text, start, end) {
        const textSection = text.slice(start, end);
        return (textSection.match(/\n/g) || []).length;
    }
    async splitDocuments(documents, chunkHeaderOptions = {}) {
        const selectedDocuments = documents.filter((doc) => doc.pageContent !== undefined);
        const texts = selectedDocuments.map((doc) => doc.pageContent);
        const metadatas = selectedDocuments.map((doc) => doc.metadata);
        return this.createDocuments(texts, metadatas, chunkHeaderOptions);
    }
    joinDocs(docs, separator) {
        const text = docs.join(separator).trim();
        return text === "" ? null : text;
    }
    async mergeSplits(splits, separator) {
        const docs = [];
        const currentDoc = [];
        let total = 0;
        for (const d of splits) {
            const _len = await this.lengthFunction(d);
            if (total + _len + currentDoc.length * separator.length >
                this.chunkSize) {
                if (total > this.chunkSize) {
                    console.warn(`Created a chunk of size ${total}, +
which is longer than the specified ${this.chunkSize}`);
                }
                if (currentDoc.length > 0) {
                    const doc = this.joinDocs(currentDoc, separator);
                    if (doc !== null) {
                        docs.push(doc);
                    }
                    // Keep on popping if:
                    // - we have a larger chunk than in the chunk overlap
                    // - or if we still have any chunks and the length is long
                    while (total > this.chunkOverlap ||
                        (total + _len + currentDoc.length * separator.length >
                            this.chunkSize &&
                            total > 0)) {
                        total -= await this.lengthFunction(currentDoc[0]);
                        currentDoc.shift();
                    }
                }
            }
            currentDoc.push(d);
            total += _len;
        }
        const doc = this.joinDocs(currentDoc, separator);
        if (doc !== null) {
            docs.push(doc);
        }
        return docs;
    }
}
export class CharacterTextSplitter extends TextSplitter {
    static lc_name() {
        return "CharacterTextSplitter";
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "separator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "\n\n"
        });
        this.separator = fields?.separator ?? this.separator;
    }
    async splitText(text) {
        // First we naively split the large input into a bunch of smaller ones.
        const splits = this.splitOnSeparator(text, this.separator);
        return this.mergeSplits(splits, this.keepSeparator ? "" : this.separator);
    }
}
export const SupportedTextSplitterLanguages = [
    "cpp",
    "go",
    "java",
    "js",
    "php",
    "proto",
    "python",
    "rst",
    "ruby",
    "rust",
    "scala",
    "swift",
    "markdown",
    "latex",
    "html",
    "sol",
];
export class RecursiveCharacterTextSplitter extends TextSplitter {
    static lc_name() {
        return "RecursiveCharacterTextSplitter";
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "separators", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["\n\n", "\n", " ", ""]
        });
        this.separators = fields?.separators ?? this.separators;
        this.keepSeparator = fields?.keepSeparator ?? true;
    }
    async _splitText(text, separators) {
        const finalChunks = [];
        // Get appropriate separator to use
        let separator = separators[separators.length - 1];
        let newSeparators;
        for (let i = 0; i < separators.length; i += 1) {
            const s = separators[i];
            if (s === "") {
                separator = s;
                break;
            }
            if (text.includes(s)) {
                separator = s;
                newSeparators = separators.slice(i + 1);
                break;
            }
        }
        // Now that we have the separator, split the text
        const splits = this.splitOnSeparator(text, separator);
        // Now go merging things, recursively splitting longer texts.
        let goodSplits = [];
        const _separator = this.keepSeparator ? "" : separator;
        for (const s of splits) {
            if ((await this.lengthFunction(s)) < this.chunkSize) {
                goodSplits.push(s);
            }
            else {
                if (goodSplits.length) {
                    const mergedText = await this.mergeSplits(goodSplits, _separator);
                    finalChunks.push(...mergedText);
                    goodSplits = [];
                }
                if (!newSeparators) {
                    finalChunks.push(s);
                }
                else {
                    const otherInfo = await this._splitText(s, newSeparators);
                    finalChunks.push(...otherInfo);
                }
            }
        }
        if (goodSplits.length) {
            const mergedText = await this.mergeSplits(goodSplits, _separator);
            finalChunks.push(...mergedText);
        }
        return finalChunks;
    }
    async splitText(text) {
        return this._splitText(text, this.separators);
    }
    static fromLanguage(language, options) {
        return new RecursiveCharacterTextSplitter({
            ...options,
            separators: RecursiveCharacterTextSplitter.getSeparatorsForLanguage(language),
        });
    }
    static getSeparatorsForLanguage(language) {
        if (language === "cpp") {
            return [
                // Split along class definitions
                "\nclass ",
                // Split along function definitions
                "\nvoid ",
                "\nint ",
                "\nfloat ",
                "\ndouble ",
                // Split along control flow statements
                "\nif ",
                "\nfor ",
                "\nwhile ",
                "\nswitch ",
                "\ncase ",
                // Split by the normal type of lines
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else if (language === "go") {
            return [
                // Split along function definitions
                "\nfunc ",
                "\nvar ",
                "\nconst ",
                "\ntype ",
                // Split along control flow statements
                "\nif ",
                "\nfor ",
                "\nswitch ",
                "\ncase ",
                // Split by the normal type of lines
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else if (language === "java") {
            return [
                // Split along class definitions
                "\nclass ",
                // Split along method definitions
                "\npublic ",
                "\nprotected ",
                "\nprivate ",
                "\nstatic ",
                // Split along control flow statements
                "\nif ",
                "\nfor ",
                "\nwhile ",
                "\nswitch ",
                "\ncase ",
                // Split by the normal type of lines
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else if (language === "js") {
            return [
                // Split along function definitions
                "\nfunction ",
                "\nconst ",
                "\nlet ",
                "\nvar ",
                "\nclass ",
                // Split along control flow statements
                "\nif ",
                "\nfor ",
                "\nwhile ",
                "\nswitch ",
                "\ncase ",
                "\ndefault ",
                // Split by the normal type of lines
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else if (language === "php") {
            return [
                // Split along function definitions
                "\nfunction ",
                // Split along class definitions
                "\nclass ",
                // Split along control flow statements
                "\nif ",
                "\nforeach ",
                "\nwhile ",
                "\ndo ",
                "\nswitch ",
                "\ncase ",
                // Split by the normal type of lines
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else if (language === "proto") {
            return [
                // Split along message definitions
                "\nmessage ",
                // Split along service definitions
                "\nservice ",
                // Split along enum definitions
                "\nenum ",
                // Split along option definitions
                "\noption ",
                // Split along import statements
                "\nimport ",
                // Split along syntax declarations
                "\nsyntax ",
                // Split by the normal type of lines
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else if (language === "python") {
            return [
                // First, try to split along class definitions
                "\nclass ",
                "\ndef ",
                "\n\tdef ",
                // Now split by the normal type of lines
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else if (language === "rst") {
            return [
                // Split along section titles
                "\n===\n",
                "\n---\n",
                "\n***\n",
                // Split along directive markers
                "\n.. ",
                // Split by the normal type of lines
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else if (language === "ruby") {
            return [
                // Split along method definitions
                "\ndef ",
                "\nclass ",
                // Split along control flow statements
                "\nif ",
                "\nunless ",
                "\nwhile ",
                "\nfor ",
                "\ndo ",
                "\nbegin ",
                "\nrescue ",
                // Split by the normal type of lines
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else if (language === "rust") {
            return [
                // Split along function definitions
                "\nfn ",
                "\nconst ",
                "\nlet ",
                // Split along control flow statements
                "\nif ",
                "\nwhile ",
                "\nfor ",
                "\nloop ",
                "\nmatch ",
                "\nconst ",
                // Split by the normal type of lines
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else if (language === "scala") {
            return [
                // Split along class definitions
                "\nclass ",
                "\nobject ",
                // Split along method definitions
                "\ndef ",
                "\nval ",
                "\nvar ",
                // Split along control flow statements
                "\nif ",
                "\nfor ",
                "\nwhile ",
                "\nmatch ",
                "\ncase ",
                // Split by the normal type of lines
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else if (language === "swift") {
            return [
                // Split along function definitions
                "\nfunc ",
                // Split along class definitions
                "\nclass ",
                "\nstruct ",
                "\nenum ",
                // Split along control flow statements
                "\nif ",
                "\nfor ",
                "\nwhile ",
                "\ndo ",
                "\nswitch ",
                "\ncase ",
                // Split by the normal type of lines
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else if (language === "markdown") {
            return [
                // First, try to split along Markdown headings (starting with level 2)
                "\n## ",
                "\n### ",
                "\n#### ",
                "\n##### ",
                "\n###### ",
                // Note the alternative syntax for headings (below) is not handled here
                // Heading level 2
                // ---------------
                // End of code block
                "```\n\n",
                // Horizontal lines
                "\n\n***\n\n",
                "\n\n---\n\n",
                "\n\n___\n\n",
                // Note that this splitter doesn't handle horizontal lines defined
                // by *three or more* of ***, ---, or ___, but this is not handled
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else if (language === "latex") {
            return [
                // First, try to split along Latex sections
                "\n\\chapter{",
                "\n\\section{",
                "\n\\subsection{",
                "\n\\subsubsection{",
                // Now split by environments
                "\n\\begin{enumerate}",
                "\n\\begin{itemize}",
                "\n\\begin{description}",
                "\n\\begin{list}",
                "\n\\begin{quote}",
                "\n\\begin{quotation}",
                "\n\\begin{verse}",
                "\n\\begin{verbatim}",
                // Now split by math environments
                "\n\\begin{align}",
                "$$",
                "$",
                // Now split by the normal type of lines
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else if (language === "html") {
            return [
                // First, try to split along HTML tags
                "<body>",
                "<div>",
                "<p>",
                "<br>",
                "<li>",
                "<h1>",
                "<h2>",
                "<h3>",
                "<h4>",
                "<h5>",
                "<h6>",
                "<span>",
                "<table>",
                "<tr>",
                "<td>",
                "<th>",
                "<ul>",
                "<ol>",
                "<header>",
                "<footer>",
                "<nav>",
                // Head
                "<head>",
                "<style>",
                "<script>",
                "<meta>",
                "<title>",
                // Normal type of lines
                " ",
                "",
            ];
        }
        else if (language === "sol") {
            return [
                // Split along compiler informations definitions
                "\npragma ",
                "\nusing ",
                // Split along contract definitions
                "\ncontract ",
                "\ninterface ",
                "\nlibrary ",
                // Split along method definitions
                "\nconstructor ",
                "\ntype ",
                "\nfunction ",
                "\nevent ",
                "\nmodifier ",
                "\nerror ",
                "\nstruct ",
                "\nenum ",
                // Split along control flow statements
                "\nif ",
                "\nfor ",
                "\nwhile ",
                "\ndo while ",
                "\nassembly ",
                // Split by the normal type of lines
                "\n\n",
                "\n",
                " ",
                "",
            ];
        }
        else {
            throw new Error(`Language ${language} is not supported.`);
        }
    }
}
/**
 * Implementation of splitter which looks at tokens.
 */
export class TokenTextSplitter extends TextSplitter {
    static lc_name() {
        return "TokenTextSplitter";
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "encodingName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "allowedSpecial", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "disallowedSpecial", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tokenizer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.encodingName = fields?.encodingName ?? "gpt2";
        this.allowedSpecial = fields?.allowedSpecial ?? [];
        this.disallowedSpecial = fields?.disallowedSpecial ?? "all";
    }
    async splitText(text) {
        if (!this.tokenizer) {
            this.tokenizer = await getEncoding(this.encodingName);
        }
        const splits = [];
        const input_ids = this.tokenizer.encode(text, this.allowedSpecial, this.disallowedSpecial);
        let start_idx = 0;
        while (start_idx < input_ids.length) {
            if (start_idx > 0) {
                start_idx -= this.chunkOverlap;
            }
            const end_idx = Math.min(start_idx + this.chunkSize, input_ids.length);
            const chunk_ids = input_ids.slice(start_idx, end_idx);
            splits.push(this.tokenizer.decode(chunk_ids));
            start_idx = end_idx;
        }
        return splits;
    }
}
export class MarkdownTextSplitter extends RecursiveCharacterTextSplitter {
    constructor(fields) {
        super({
            ...fields,
            separators: RecursiveCharacterTextSplitter.getSeparatorsForLanguage("markdown"),
        });
    }
}
export class LatexTextSplitter extends RecursiveCharacterTextSplitter {
    constructor(fields) {
        super({
            ...fields,
            separators: RecursiveCharacterTextSplitter.getSeparatorsForLanguage("latex"),
        });
    }
}
