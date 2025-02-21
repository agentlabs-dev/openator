export type VariableParams = {
  name: string;
  value: string;
  isSecret: boolean;
};

export class Variable {
  readonly name: string;
  readonly isSecret: boolean;
  private readonly _value: string;

  constructor(params: VariableParams) {
    this.name = params.name;
    this.isSecret = params.isSecret;

    this._value = params.value;
  }

  publicValue(): string {
    return this.isSecret ? `{{${this.name}}}` : this._value;
  }

  dangerousValue(): string {
    return this._value;
  }
}
