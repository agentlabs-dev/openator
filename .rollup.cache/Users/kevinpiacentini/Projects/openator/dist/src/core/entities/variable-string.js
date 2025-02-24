export class VariableString {
    constructor(_value, variables) {
        this._value = _value;
        this.variables = variables;
    }
    publicValue() {
        let interpolatedValue = this._value;
        const variablePattern = /{{(.*?)}}/g;
        interpolatedValue = interpolatedValue.replace(variablePattern, (_, varName) => {
            const variable = this.variables.find((v) => v.name === varName);
            return variable ? variable.publicValue() : `{{${varName}}}`;
        });
        return interpolatedValue;
    }
    dangerousValue() {
        let interpolatedValue = this._value;
        const variablePattern = /{{(.*?)}}/g;
        interpolatedValue = interpolatedValue.replace(variablePattern, (_, varName) => {
            const variable = this.variables.find((v) => v.name === varName);
            return variable ? variable.dangerousValue() : `{{${varName}}}`;
        });
        return interpolatedValue;
    }
}
//# sourceMappingURL=variable-string.js.map