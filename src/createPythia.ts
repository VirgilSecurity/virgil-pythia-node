import { IPythiaCrypto } from './IPythiaCrypto';
import { ProofKeys } from './ProofKeys';
import { Pythia } from './Pythia';
import { PythiaClient } from './PythiaClient';
import { ICrypto, IAccessTokenProvider } from './types';

export const createPythia = (options: {
  virgilCrypto: ICrypto;
  virgilPythiaCrypto: IPythiaCrypto;
  accessTokenProvider: IAccessTokenProvider;
  proofKeys: string | string[];
  apiUrl?: string;
}) => {
  const proofKeys = new ProofKeys(options.proofKeys);
  const pythiaClient = new PythiaClient(options.accessTokenProvider, options.apiUrl);
  return new Pythia({
    proofKeys,
    pythiaClient,
    crypto: options.virgilCrypto,
    pythiaCrypto: options.virgilPythiaCrypto,
  });
};
