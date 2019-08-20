import { expect } from 'chai';
import uuid from 'uuid/v4';

import { initCrypto, VirgilCrypto, VirgilAccessTokenSigner } from 'virgil-crypto';
import { JwtGenerator, GeneratorJwtProvider } from 'virgil-sdk';

import { initPythia, PythiaClient, PythiaCrypto } from '../index';
import { RATE_LIMIT, sleep } from './utils';

describe('PythiaCrypto', () => {
  let virgilCrypto: VirgilCrypto;
  let pythiaCrypto: PythiaCrypto;

  before(async () => {
    await Promise.all([initCrypto(), initPythia()]);
  });

  beforeEach(() => {
    virgilCrypto = new VirgilCrypto();
    pythiaCrypto = new PythiaCrypto(virgilCrypto);
  });

  describe('blind', () => {
    it('blinds password', () => {
      const result = pythiaCrypto.blind({ value: 'password', encoding: 'utf8' });
      expect(result).to.have.keys('blindedPassword', 'blindingSecret');
      expect(result.blindedPassword).to.be.instanceOf(Uint8Array);
      expect(result.blindingSecret).to.be.instanceOf(Uint8Array);
    });
  });

  describe('deblind', () => {
    it('deblinds `transformedPassword` with previously returned `blindingSecret` from `blind()`', async () => {
      await sleep(RATE_LIMIT);
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
      const { blindedPassword, blindingSecret } = pythiaCrypto.blind({
        value: 'password',
        encoding: 'utf8',
      });
      const transformedPassword = await pythiaClient.generateSeed(blindedPassword);
      const result1 = pythiaCrypto.deblind(transformedPassword, blindingSecret);
      const result2 = pythiaCrypto.deblind(transformedPassword, blindingSecret);
      expect(result1).to.be.instanceOf(Uint8Array);
      expect(result1.equals(result2)).to.be.true;
    });
  });

  describe('generateKeyPair', () => {
    it('generates key pair properly', () => {
      const seed = virgilCrypto.getRandomBytes(32);
      const keyPair1 = pythiaCrypto.generateKeyPair(seed);
      const keyPair2 = pythiaCrypto.generateKeyPair(seed);
      const privateKey1 = virgilCrypto.exportPrivateKey(keyPair1.privateKey);
      const publicKey1 = virgilCrypto.exportPublicKey(keyPair1.publicKey);
      const privateKey2 = virgilCrypto.exportPrivateKey(keyPair2.privateKey);
      const publicKey2 = virgilCrypto.exportPublicKey(keyPair2.publicKey);
      expect(privateKey1.equals(privateKey2)).to.be.true;
      expect(publicKey1.equals(publicKey2)).to.be.true;
    });
  });

  describe('updateDeblindedWithToken', () => {
    it('works', () => {
      expect(true).to.be.true;
    });
  });

  describe('verify', () => {
    it('works', () => {
      expect(true).to.be.true;
    });
  });
});
