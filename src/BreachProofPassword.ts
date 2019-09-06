import { NodeBuffer } from './types';

export class BreachProofPassword {
  readonly salt: string;
  readonly deblindedPassword: string;
  readonly version: number;

  constructor(salt: NodeBuffer | string, deblindedPassword: NodeBuffer | string, version: number) {
    this.salt = BreachProofPassword.valueToString(salt);
    this.deblindedPassword = BreachProofPassword.valueToString(deblindedPassword);
    this.version = version;
  }

  toJSON() {
    return {
      salt: this.salt,
      deblindedPassword: this.deblindedPassword,
      version: this.version,
    };
  }

  private static valueToString(value: NodeBuffer | string) {
    if (typeof value === 'string') {
      return value;
    }
    return value.toString('base64');
  }
}
