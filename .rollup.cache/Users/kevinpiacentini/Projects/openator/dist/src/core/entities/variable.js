export class Variable {
    constructor(params) {
        this.name = params.name;
        this.isSecret = params.isSecret;
        this._value = params.value;
    }
    publicValue() {
        return this.isSecret ? `{{${this.name}}}` : this._value;
    }
    dangerousValue() {
        return this._value;
    }
}
//# sourceMappingURL=variable.js.map