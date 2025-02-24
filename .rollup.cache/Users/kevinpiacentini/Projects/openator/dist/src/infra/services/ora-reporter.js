import * as ora from 'ora-classic';
export class OraReporter {
    constructor(name) {
        this.name = name;
    }
    getSpinner() {
        if (!this.spinner) {
            this.spinner = ora({ prefixText: `[${this.name}]` }).start();
        }
        return this.spinner;
    }
    success(message) {
        this.getSpinner().stopAndPersist({
            symbol: '✅',
            text: message,
        });
    }
    failure(message) {
        this.getSpinner().stopAndPersist({
            symbol: '❌',
            text: message,
        });
    }
    loading(message) {
        this.getSpinner().text = message;
        this.getSpinner().start();
    }
    info(message) {
        this.spinner?.stopAndPersist({
            symbol: '💡',
            text: message,
        });
    }
}
//# sourceMappingURL=ora-reporter.js.map