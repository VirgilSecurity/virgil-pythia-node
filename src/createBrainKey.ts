import { BrainKey } from './BrainKey';
import { PythiaClient } from './PythiaClient';
import { ICrypto, IBrainKeyCrypto, IAccessTokenProvider } from './types';

export const createBrainKey = (options: {
  virgilCrypto: ICrypto;
  virgilPythiaCrypto: IBrainKeyCrypto;
  accessTokenProvider: IAccessTokenProvider;
  keyPairType?: unknown;
  apiUrl?: string;
}) => {
  const pythiaClient = new PythiaClient(options.accessTokenProvider, options.apiUrl);
  return new BrainKey({
    pythiaClient,
    crypto: options.virgilCrypto,
    brainKeyCrypto: options.virgilPythiaCrypto,
    keyPairType: options.keyPairType,
  });
};
