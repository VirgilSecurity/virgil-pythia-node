import { IPrivateKey, IPublicKey } from './types';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPythiaCrypto {
  blind(password: Uint8Array): { blindedPassword: Uint8Array; blindingSecret: Uint8Array };
  deblind(transformedPassword: Uint8Array, blindingSecret: Uint8Array): Uint8Array;
  generateKeyPair(seed: Uint8Array): { privateKey: IPrivateKey; publicKey: IPublicKey };
}
