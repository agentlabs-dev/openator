export interface FileSystem {
  saveFile(path: string, data: Buffer): Promise<string>;
  saveScreenshot(filename: string, data: Buffer): Promise<string>;
}
