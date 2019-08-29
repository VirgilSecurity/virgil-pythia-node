import { NodeBuffer } from './types';

export class BreachProofPassword {
  readonly salt: NodeBuffer;
  readonly deblindedPassword: NodeBuffer;
  readonly version: number;

  constructor(salt: NodeBuffer, deblindedPassword: NodeBuffer, version: number) {
    this.salt = salt;
    this.deblindedPassword = deblindedPassword;
    this.version = version;
  }

  toJSON() {
    return {
      salt: this.salt.toString('base64'),
      deblindedPassword: this.deblindedPassword.toString('base64'),
      version: this.version,
    };
  }
}
