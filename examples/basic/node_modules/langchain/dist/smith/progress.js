export class ProgressBar {
    constructor(props) {
        Object.defineProperty(this, "total", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "current", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "barLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "format", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const { total, format, barLength } = props;
        this.total = total;
        this.current = 0;
        this.barLength = barLength ?? 40;
        this.format = format || "{bar} {percentage}% | {value}/{total}";
    }
    initialize() {
        this.update({ current: 0 });
    }
    update({ current, formatArgs, }) {
        this.current = current;
        const ratio = this.current / this.total;
        const filledBarLength = Math.round(ratio * this.barLength);
        const emptyBarLength = this.barLength - filledBarLength;
        const filledBar = "▓".repeat(filledBarLength);
        const emptyBar = "░".repeat(emptyBarLength);
        const percentage = (ratio * 100).toFixed(2);
        let formattedString = this.format
            .replace("{bar}", `${filledBar}${emptyBar}`)
            .replace("{percentage}", percentage)
            .replace("{value}", this.current.toString())
            .replace("{total}", this.total.toString());
        if (formatArgs) {
            for (const key in formatArgs) {
                if (Object.prototype.hasOwnProperty.call(formatArgs, key)) {
                    formattedString = formattedString.replace(`{${key}}`, formatArgs[key].toString());
                }
            }
        }
        console.log(formattedString);
    }
    increment({ formatArgs, } = {}) {
        this.update({ current: this.current + 1, formatArgs });
    }
    complete({ formatArgs } = {}) {
        this.update({ current: this.total, formatArgs });
        console.log("\nCompleted");
    }
}
