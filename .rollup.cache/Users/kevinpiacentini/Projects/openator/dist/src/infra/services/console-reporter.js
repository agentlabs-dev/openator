export class ConsoleReporter {
    constructor(name) {
        this.name = name;
    }
    getSpinner() { }
    success(message) {
        console.log(`[${this.name}] ✅ ${message}`);
    }
    failure(message) {
        console.log(`[${this.name}] ❌ ${message}`);
    }
    loading(message) {
        console.log(`[${this.name}] 💡 ${message}`);
    }
    info(message) {
        console.log(`[${this.name}] 💡 ${message}`);
    }
}
//# sourceMappingURL=console-reporter.js.map