export class InMemoryFileSystem {
    constructor() { }
    saveFile(path, data) {
        return this.saveScreenshot(path, data);
    }
    saveScreenshot(filename, data) {
        return new Promise((resolve, reject) => {
            try {
                const base64Data = data.toString("base64");
                const url = `data:image/png;base64,${base64Data}`;
                resolve(url);
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
//# sourceMappingURL=in-memory-file-system.js.map