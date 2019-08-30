import { BrainKey } from './BrainKey';
import { PythiaClient } from './PythiaClient';
import { ICrypto, IBrainKeyCrypto, IPythiaCrypto, IAccessTokenProvider } from './types';

export const createBrainKey = (options: {
  virgilCrypto: ICrypto;
  virgilBrainKeyCrypto: IBrainKeyCrypto;
  accessTokenProvider: IAccessTokenProvider;
  virgilPythiaCrypto?: IPythiaCrypto;
  keyPairType?: unknown;
  apiUrl?: string;
}) => {
  const pythiaClient = new PythiaClient(options.accessTokenProvider, options.apiUrl);
  if (options.virgilPythiaCrypto && console) {
    console.warn('Option `virgilPythiaCrypto` is deprecated. Use `virgilBrainKeyCrypto` instead.');
  }
  return new BrainKey({
    pythiaClient,
    crypto: options.virgilCrypto,
    brainKeyCrypto: options.virgilBrainKeyCrypto || options.virgilPythiaCrypto,
    keyPairType: options.keyPairType,
  });
};
