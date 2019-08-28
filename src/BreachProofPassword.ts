/// <reference types="node" />

export class BreachProofPassword {
  readonly salt: Buffer;
  readonly deblindedPassword: Buffer;
  readonly version: number;

  constructor(salt: Buffer, deblindedPassword: Buffer, version: number) {
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
