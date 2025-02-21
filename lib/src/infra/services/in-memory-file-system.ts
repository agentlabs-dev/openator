import { FileSystem } from "@/core/interfaces/file-system.interface";

export class InMemoryFileSystem implements FileSystem {
  constructor() {}

  saveFile(path: string, data: Buffer): Promise<string> {
    return this.saveScreenshot(path, data);
  }

  saveScreenshot(filename: string, data: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const base64Data = data.toString("base64");
        const url = `data:image/png;base64,${base64Data}`;
        resolve(url);
      } catch (error) {
        reject(error);
      }
    });
  }
}
