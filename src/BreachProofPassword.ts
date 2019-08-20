import { Buffer as NodeBuffer } from '@virgilsecurity/data-utils';

export class BreachProofPassword {
  readonly salt: Uint8Array;
  readonly deblindedPassword: Uint8Array;
  readonly version: number;

  constructor(salt: Uint8Array, deblindedPassword: Uint8Array, version: number) {
    this.salt = salt;
    this.deblindedPassword = deblindedPassword;
    this.version = version;
  }

  toJSON() {
    return {
      salt: NodeBuffer.from(this.salt).toString('base64'),
      deblindedPassword: NodeBuffer.from(this.deblindedPassword).toString('base64'),
      version: this.version,
    };
  }
}
