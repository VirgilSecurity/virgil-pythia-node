import { expect } from 'chai';
import uuid from 'uuid/v4';

import { initCrypto, VirgilCrypto, VirgilAccessTokenSigner } from 'virgil-crypto';
import { JwtGenerator, GeneratorJwtProvider } from 'virgil-sdk';

import { BrainKey, createBrainKey, initPythia, PythiaCrypto } from '../index';

describe('createBrainKey', () => {
  before(async () => {
    await Promise.all([initCrypto(), initPythia()]);
  });

  it('returns an instance of `BrainKey`', () => {
    const virgilCrypto = new VirgilCrypto();
    const virgilPythiaCrypto = new PythiaCrypto(virgilCrypto);
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
    const brainKey = createBrainKey({
      virgilCrypto,
      virgilPythiaCrypto,
      accessTokenProvider,
      apiUrl: process.env.VIRGIL_API_URL!,
    })
    expect(brainKey).to.be.instanceOf(BrainKey);
  });
});
