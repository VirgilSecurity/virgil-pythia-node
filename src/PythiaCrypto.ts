import { VirgilCrypto } from 'virgil-crypto';

import { IPythiaCrypto } from './IPythiaCrypto';
import { getPythiaModules } from './pythiaModules';
import { Data } from './types';
import { dataToUint8Array, toBuffer } from './utils';

export class PythiaCrypto implements IPythiaCrypto {
  private readonly virgilCrypto: VirgilCrypto;

  constructor(virgilCrypto: VirgilCrypto) {
    if (virgilCrypto == null) {
      throw new Error('`virgilCrypto` is required');
    }
    this.virgilCrypto = virgilCrypto;
  }

  blind(password: Data) {
    const { Pythia } = getPythiaModules();
    const myPassword = dataToUint8Array(password, 'utf8');
    const { blindedPassword, blindingSecret } = Pythia.blind(myPassword);
    return {
      blindedPassword: toBuffer(blindedPassword),
      blindingSecret: toBuffer(blindingSecret),
    };
  }

  deblind(transformedPassword: Data, blindingSecret: Data) {
    const { Pythia } = getPythiaModules();
    const myTransformedPassword = dataToUint8Array(transformedPassword, 'base64');
    const myBlindingSecret = dataToUint8Array(blindingSecret, 'base64');
    const result = Pythia.deblind(myTransformedPassword, myBlindingSecret);
    return toBuffer(result);
  }

  generateKeyPair(seed: Data) {
    const mySeed = dataToUint8Array(seed, 'base64');
    return this.virgilCrypto.generateKeysFromKeyMaterial(mySeed);
  }
}
