import { T as TiktokenEncoding, a as Tiktoken, b as TiktokenModel } from './core-e44f7fdc.js';
export { c as TiktokenBPE, g as getEncodingNameForModel } from './core-e44f7fdc.js';

declare function getEncoding(encoding: TiktokenEncoding, extendSpecialTokens?: Record<string, number>): Tiktoken;
declare function encodingForModel(model: TiktokenModel, extendSpecialTokens?: Record<string, number>): Tiktoken;

export { Tiktoken, TiktokenEncoding, TiktokenModel, encodingForModel, getEncoding };
