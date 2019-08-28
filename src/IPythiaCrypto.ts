/// <reference types="node" />

import { Data, IPrivateKey, IPublicKey } from './types';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPythiaCrypto {
  blind(password: Data): { blindedPassword: Buffer; blindingSecret: Buffer };
  deblind(transformedPassword: Data, blindingSecret: Data): Buffer;
  generateKeyPair(seed: Data): { privateKey: IPrivateKey; publicKey: IPublicKey };
  updateDeblindedWithToken(deblindedPassword: Data, passwordUpdateToken: Data): Buffer;
  verify(
    transformedPassword: Data,
    blindedPassword: Data,
    tweak: Data,
    transformationPublicKey: Data,
    proofValueC: Data,
    proofValueU: Data,
  ): boolean;
}
