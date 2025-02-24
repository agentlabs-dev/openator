export class LocalFileSystem {
    constructor() { }
    bufferFromStringUrl(encodedScreenshot) {
        const base64Data = encodedScreenshot.replace(/^data:image\/png;base64,/, '');
        return Buffer.from(base64Data, 'base64');
    }
    saveFile(path, data) {
        return this.saveScreenshot(path, data);
    }
    saveScreenshot(filename, data) {
        return new Promise((resolve, reject) => {
            const fs = require('fs');
            const path = require('path');
            const filePath = path.join('/tmp/screenshots', filename);
            fs.writeFile(filePath, data, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(filePath);
                }
            });
        });
    }
}
//# sourceMappingURL=local-file-system.js.map