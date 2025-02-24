import { FileSystem } from '@/core/interfaces/file-system.interface';
export declare class LocalFileSystem implements FileSystem {
    constructor();
    bufferFromStringUrl(encodedScreenshot: string): Buffer;
    saveFile(path: string, data: Buffer): Promise<string>;
    saveScreenshot(filename: string, data: Buffer): Promise<string>;
}
