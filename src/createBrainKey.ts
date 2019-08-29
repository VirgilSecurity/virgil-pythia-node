import { BrainKey } from './BrainKey';
import { IPythiaCrypto } from './IPythiaCrypto';
import { PythiaClient } from './PythiaClient';
import { ICrypto, IAccessTokenProvider } from './types';

export const createBrainKey = (options: {
  virgilCrypto: ICrypto;
  virgilPythiaCrypto: IPythiaCrypto;
  accessTokenProvider: IAccessTokenProvider;
  keyPairType?: unknown;
  apiUrl?: string;
}) => {
  const pythiaClient = new PythiaClient(options.accessTokenProvider, options.apiUrl);
  return new BrainKey(options.virgilPythiaCrypto, pythiaClient, options.keyPairType);
};
