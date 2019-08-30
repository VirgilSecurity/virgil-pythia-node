import { expect } from 'chai';
import uuid from 'uuid/v4';

import { initPythia, VirgilPythiaCrypto } from '@virgilsecurity/pythia-crypto';
import { initCrypto, VirgilCrypto, VirgilAccessTokenSigner } from 'virgil-crypto';
import { JwtGenerator, GeneratorJwtProvider } from 'virgil-sdk';

import { createPythia, Pythia } from '../index';

describe('createPythia', () => {
  before(async () => {
    await Promise.all([initCrypto(), initPythia()]);
  });

  it('returns an instance of `Pythia`', () => {
    const virgilCrypto = new VirgilCrypto();
    const virgilPythiaCrypto = new VirgilPythiaCrypto();
    const jwtGenerator = new JwtGenerator({
      apiKey: virgilCrypto.importPrivateKey({
        value: process.env.VIRGIL_API_KEY!,
        encoding: 'base64',
      }),
      apiKeyId: process.env.VIRGIL_API_KEY_ID!,
      appId: process.env.VIRGIL_APP_ID!,
      accessTokenSigner: new VirgilAccessTokenSigner(virgilCrypto),
    });
    const accessTokenProvider = new GeneratorJwtProvider(jwtGenerator, undefined, uuid());
    const pythia = createPythia({
      virgilCrypto,
      virgilPythiaCrypto,
      accessTokenProvider,
      proofKeys: process.env.MY_PROOF_KEYS!.split(';'),
      apiUrl: process.env.VIRGIL_API_URL!,
    });
    expect(pythia).to.be.instanceOf(Pythia);
  });
});
