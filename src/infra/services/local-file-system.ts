import { FileSystem } from '@/core/interfaces/file-system.interface';

export class LocalFileSystem implements FileSystem {
  constructor() {}

  bufferFromStringUrl(encodedScreenshot: string): Buffer {
    const base64Data = encodedScreenshot.replace(
      /^data:image\/png;base64,/,
      '',
    );
    return Buffer.from(base64Data, 'base64');
  }

  saveFile(path: string, data: Buffer): Promise<string> {
    return this.saveScreenshot(path, data);
  }

  saveScreenshot(filename: string, data: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const fs = require('fs');
      const path = require('path');

      const filePath = path.join('/tmp/screenshots', filename);

      fs.writeFile(filePath, data, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(filePath);
        }
      });
    });
  }
}
