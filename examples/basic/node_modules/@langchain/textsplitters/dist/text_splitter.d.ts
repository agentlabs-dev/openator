import type * as tiktoken from "js-tiktoken";
import { Document, BaseDocumentTransformer } from "@langchain/core/documents";
export interface TextSplitterParams {
    chunkSize: number;
    chunkOverlap: number;
    keepSeparator: boolean;
    lengthFunction?: ((text: string) => number) | ((text: string) => Promise<number>);
}
export type TextSplitterChunkHeaderOptions = {
    chunkHeader?: string;
    chunkOverlapHeader?: string;
    appendChunkOverlapHeader?: boolean;
};
export declare abstract class TextSplitter extends BaseDocumentTransformer implements TextSplitterParams {
    lc_namespace: string[];
    chunkSize: number;
    chunkOverlap: number;
    keepSeparator: boolean;
    lengthFunction: ((text: string) => number) | ((text: string) => Promise<number>);
    constructor(fields?: Partial<TextSplitterParams>);
    transformDocuments(documents: Document[], chunkHeaderOptions?: TextSplitterChunkHeaderOptions): Promise<Document[]>;
    abstract splitText(text: string): Promise<string[]>;
    protected splitOnSeparator(text: string, separator: string): string[];
    createDocuments(texts: string[], metadatas?: Record<string, any>[], chunkHeaderOptions?: TextSplitterChunkHeaderOptions): Promise<Document[]>;
    private numberOfNewLines;
    splitDocuments(documents: Document[], chunkHeaderOptions?: TextSplitterChunkHeaderOptions): Promise<Document[]>;
    private joinDocs;
    mergeSplits(splits: string[], separator: string): Promise<string[]>;
}
export interface CharacterTextSplitterParams extends TextSplitterParams {
    separator: string;
}
export declare class CharacterTextSplitter extends TextSplitter implements CharacterTextSplitterParams {
    static lc_name(): string;
    separator: string;
    constructor(fields?: Partial<CharacterTextSplitterParams>);
    splitText(text: string): Promise<string[]>;
}
export interface RecursiveCharacterTextSplitterParams extends TextSplitterParams {
    separators: string[];
}
export declare const SupportedTextSplitterLanguages: readonly ["cpp", "go", "java", "js", "php", "proto", "python", "rst", "ruby", "rust", "scala", "swift", "markdown", "latex", "html", "sol"];
export type SupportedTextSplitterLanguage = (typeof SupportedTextSplitterLanguages)[number];
export declare class RecursiveCharacterTextSplitter extends TextSplitter implements RecursiveCharacterTextSplitterParams {
    static lc_name(): string;
    separators: string[];
    constructor(fields?: Partial<RecursiveCharacterTextSplitterParams>);
    private _splitText;
    splitText(text: string): Promise<string[]>;
    static fromLanguage(language: SupportedTextSplitterLanguage, options?: Partial<RecursiveCharacterTextSplitterParams>): RecursiveCharacterTextSplitter;
    static getSeparatorsForLanguage(language: SupportedTextSplitterLanguage): string[];
}
export interface TokenTextSplitterParams extends TextSplitterParams {
    encodingName: tiktoken.TiktokenEncoding;
    allowedSpecial: "all" | Array<string>;
    disallowedSpecial: "all" | Array<string>;
}
/**
 * Implementation of splitter which looks at tokens.
 */
export declare class TokenTextSplitter extends TextSplitter implements TokenTextSplitterParams {
    static lc_name(): string;
    encodingName: tiktoken.TiktokenEncoding;
    allowedSpecial: "all" | Array<string>;
    disallowedSpecial: "all" | Array<string>;
    private tokenizer;
    constructor(fields?: Partial<TokenTextSplitterParams>);
    splitText(text: string): Promise<string[]>;
}
export type MarkdownTextSplitterParams = TextSplitterParams;
export declare class MarkdownTextSplitter extends RecursiveCharacterTextSplitter implements MarkdownTextSplitterParams {
    constructor(fields?: Partial<MarkdownTextSplitterParams>);
}
export type LatexTextSplitterParams = TextSplitterParams;
export declare class LatexTextSplitter extends RecursiveCharacterTextSplitter implements LatexTextSplitterParams {
    constructor(fields?: Partial<LatexTextSplitterParams>);
}
