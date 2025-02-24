import { FileSystem } from "@/core/interfaces/file-system.interface";
export declare class InMemoryFileSystem implements FileSystem {
    constructor();
    saveFile(path: string, data: Buffer): Promise<string>;
    saveScreenshot(filename: string, data: Buffer): Promise<string>;
}
