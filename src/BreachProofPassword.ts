import { NodeBuffer } from '@virgilsecurity/data-utils';

import { NodeBuffer as BufferType } from './types';

export class BreachProofPassword {
  readonly salt: BufferType;
  readonly deblindedPassword: BufferType;
  readonly version: number;

  constructor(salt: BufferType | string, deblindedPassword: BufferType | string, version: number) {
    this.salt = BreachProofPassword.toNodeBuffer(salt);
    this.deblindedPassword = BreachProofPassword.toNodeBuffer(deblindedPassword);
    this.version = version;
  }

  toJSON() {
    return {
      salt: this.salt.toString('base64'),
      deblindedPassword: this.deblindedPassword.toString('base64'),
      version: this.version,
    };
  }

  private static toNodeBuffer(value: BufferType | string) {
    if (NodeBuffer.isBuffer(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return NodeBuffer.from(value, 'base64');
    }
    throw new TypeError('`value` should be a Buffer or a string');
  }
}
