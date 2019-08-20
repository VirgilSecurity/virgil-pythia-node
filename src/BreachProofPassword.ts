import { Buffer as NodeBuffer, dataToUint8Array } from '@virgilsecurity/data-utils';

import { Data } from './types';

export class BreachProofPassword {
  readonly salt: Uint8Array;
  readonly deblindedPassword: Uint8Array;
  readonly version: number;

  constructor(salt: Data, deblindedPassword: Data, version: number) {
    this.salt = dataToUint8Array(salt, 'base64');
    this.deblindedPassword = dataToUint8Array(deblindedPassword, 'base64');
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
