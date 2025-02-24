import { Tiktoken, TiktokenEncoding, TiktokenModel } from "js-tiktoken/lite";
export declare function getEncoding(encoding: TiktokenEncoding): Promise<Tiktoken>;
export declare function encodingForModel(model: TiktokenModel): Promise<Tiktoken>;
