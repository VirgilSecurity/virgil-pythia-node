import { NodeBuffer } from './types';

import { Data, IPrivateKey, IPublicKey } from './types';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPythiaCrypto {
  blind(password: Data): { blindedPassword: NodeBuffer; blindingSecret: NodeBuffer };
  deblind(transformedPassword: Data, blindingSecret: Data): NodeBuffer;
  generateKeyPair(seed: Data): { privateKey: IPrivateKey; publicKey: IPublicKey };
  updateDeblindedWithToken(deblindedPassword: Data, passwordUpdateToken: Data): NodeBuffer;
  verify(
    transformedPassword: Data,
    blindedPassword: Data,
    tweak: Data,
    transformationPublicKey: Data,
    proofValueC: Data,
    proofValueU: Data,
  ): boolean;
}
