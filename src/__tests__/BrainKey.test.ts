import { NodeBuffer } from '@virgilsecurity/data-utils';
import { expect } from 'chai';
import uuid from 'uuid/v4';

import { initCrypto, VirgilCrypto, VirgilAccessTokenSigner, VirgilKeyPair } from 'virgil-crypto';
import { JwtGenerator, GeneratorJwtProvider } from 'virgil-sdk';

import { BrainKey, initPythia, PythiaClient, PythiaCrypto } from '../index';
import { RATE_LIMIT, sleep } from './utils';

describe('BrainKey', () => {
  let brainKey: BrainKey;

  before(async () => {
    await Promise.all([initCrypto(), initPythia()]);
  });

  beforeEach(() => {
    const virgilCrypto = new VirgilCrypto();
    const pythiaCrypto = new PythiaCrypto(virgilCrypto);
    const jwtGenerator = new JwtGenerator({
      apiKey: virgilCrypto.importPrivateKey({
        value: process.env.VIRGIL_API_KEY!,
        encoding: 'base64',
      }),
      apiKeyId: process.env.VIRGIL_API_KEY_ID!,
      appId: process.env.VIRGIL_APP_ID!,
      accessTokenSigner: new VirgilAccessTokenSigner(virgilCrypto),
    });
    const generatorJwtProvider = new GeneratorJwtProvider(jwtGenerator, undefined, uuid());
    const pythiaClient = new PythiaClient(generatorJwtProvider, process.env.VIRGIL_API_URL!);
    brainKey = new BrainKey(pythiaCrypto, pythiaClient);
  });

  describe('generateKeyPair', () => {
    it('generates key pair properly', async () => {
      const password1 = 'password1';
      const password2 = 'password2';
      const keyPair1 = (await brainKey.generateKeyPair({
        value: password1,
        encoding: 'utf8',
      })) as VirgilKeyPair;
      await sleep(RATE_LIMIT);
      const keyPair2 = (await brainKey.generateKeyPair({
        value: password1,
        encoding: 'utf8',
      })) as VirgilKeyPair;
      await sleep(RATE_LIMIT);
      const keyPair3 = (await brainKey.generateKeyPair({
        value: password2,
        encoding: 'utf8',
      })) as VirgilKeyPair;
      await sleep(RATE_LIMIT);
      const keyPair4 = (await brainKey.generateKeyPair(
        { value: password2, encoding: 'utf8' },
        'id',
      )) as VirgilKeyPair;
      await sleep(RATE_LIMIT);
      expect(NodeBuffer.from(keyPair1.publicKey.identifier).equals(keyPair2.publicKey.identifier))
        .to.be.true;
      expect(NodeBuffer.from(keyPair1.publicKey.identifier).equals(keyPair3.publicKey.identifier))
        .to.be.false;
      expect(NodeBuffer.from(keyPair3.publicKey.identifier).equals(keyPair4.publicKey.identifier))
        .to.be.false;
    });
  });
});
