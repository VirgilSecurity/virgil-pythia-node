import { dataToUint8Array, toBuffer } from '@virgilsecurity/data-utils';

import { IPythiaCrypto } from './IPythiaCrypto';
import { getPythiaModules } from './pythiaModules';
import { ICrypto, Data } from './types';

export class PythiaCrypto implements IPythiaCrypto {
  private readonly crypto: ICrypto;

  constructor(crypto: ICrypto) {
    if (crypto == null) {
      throw new Error('`crypto` is required');
    }
    this.crypto = crypto;
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
    return this.crypto.generateKeysFromKeyMaterial(mySeed);
  }

  updateDeblindedWithToken(deblindedPassword: Data, passwordUpdateToken: Data) {
    const { Pythia } = getPythiaModules();
    const myDeblindedPassword = dataToUint8Array(deblindedPassword, 'base64');
    const myPasswordUpdateToken = dataToUint8Array(passwordUpdateToken, 'base64');
    const result = Pythia.updateDeblindedWithToken(myDeblindedPassword, myPasswordUpdateToken);
    return toBuffer(result);
  }

  verify(
    transformedPassword: Data,
    blindedPassword: Data,
    tweak: Data,
    transformationPublicKey: Data,
    proofValueC: Data,
    proofValueU: Data,
  ) {
    const { Pythia } = getPythiaModules();
    const myTransformedPassword = dataToUint8Array(transformedPassword, 'base64');
    const myBlindedPassword = dataToUint8Array(blindedPassword, 'base64');
    const myTweak = dataToUint8Array(tweak, 'base64');
    const myTransformationPublicKey = dataToUint8Array(transformationPublicKey, 'base64');
    const myProofValueC = dataToUint8Array(proofValueC, 'base64');
    const myProofValueU = dataToUint8Array(proofValueU, 'base64');
    return Pythia.verify(
      myTransformedPassword,
      myBlindedPassword,
      myTweak,
      myTransformationPublicKey,
      myProofValueC,
      myProofValueU,
    );
  }
}
