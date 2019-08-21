import { Buffer as NodeBuffer } from '@virgilsecurity/data-utils';
import { expect } from 'chai';
import uuid from 'uuid/v4';

import { initCrypto, VirgilCrypto, VirgilAccessTokenSigner } from 'virgil-crypto';
import { JwtGenerator, GeneratorJwtProvider } from 'virgil-sdk';

import { BreachProofPassword, initPythia, Pythia, PythiaClient, PythiaCrypto } from '../index';
import { ProofKeys } from '../ProofKeys';
import { RATE_LIMIT, sleep } from './utils';

describe('Pythia', () => {
  let pythia: Pythia;

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
    pythia = new Pythia({
      pythiaClient,
      pythiaCrypto,
      virgilCrypto,
      proofKeys: new ProofKeys(process.env.MY_PROOF_KEYS!.split(';')[0]),
    });
  });

  describe('create', () => {
    it('returns an instance of `Pythia`', () => {
      const virgilCrypto = new VirgilCrypto();
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
      const proofKeys = process.env.MY_PROOF_KEYS!.split(';');
      const myPythia = Pythia.create({
        proofKeys,
        virgilCrypto,
        accessTokenProvider: generatorJwtProvider,
      });
      expect(myPythia).to.be.instanceOf(Pythia);
    });
  });

  describe('Registration', () => {
    beforeEach(async () => {
      await sleep(RATE_LIMIT);
    });

    it('creates new breach-proof password', async () => {
      const breachProofPassword = await pythia.createBreachProofPassword('password');
      expect(breachProofPassword.salt.byteLength).to.eql(Pythia.SALT_BYTE_LENGTH);
      expect(breachProofPassword.deblindedPassword.byteLength).to.be.greaterThan(300);
      expect(breachProofPassword.version).to.eql(1);
    });

    it('creates different passwords from the same input (YTC-13)', async () => {
      const password = 'password';
      const breachProofPassword1 = await pythia.createBreachProofPassword(password);
      const breachProofPassword2 = await pythia.createBreachProofPassword(password);
      expect(NodeBuffer.from(breachProofPassword1.salt).equals(breachProofPassword2.salt)).to.be
        .false;
      expect(
        NodeBuffer.from(breachProofPassword1.deblindedPassword).equals(
          breachProofPassword2.deblindedPassword,
        ),
      ).to.be.false;
      expect(breachProofPassword1.version).to.eql(breachProofPassword2.version);
    });
  });

  describe('Authentication', () => {
    const password = 'password';
    let breachProofPassword: BreachProofPassword;

    before(async () => {
      breachProofPassword = await pythia.createBreachProofPassword(password);
    });

    beforeEach(async () => {
      await sleep(RATE_LIMIT);
    });

    it('verifies password without proof (YTC-15)', async () => {
      const verified = await pythia.verifyBreachProofPassword(password, breachProofPassword, false);
      expect(verified).to.be.true;
    });

    it('verifies password with proof (YTC-15)', async () => {
      const verified = await pythia.verifyBreachProofPassword(password, breachProofPassword, true);
      expect(verified).to.be.true;
    });

    it('verifies wrong password (YTC-15)', async () => {
      const verified = await pythia.verifyBreachProofPassword('wrong', breachProofPassword, false);
      expect(verified).to.be.false;
    });

    it('verifies wrong password with proof (YTC-15)', async () => {
      const verified = await pythia.verifyBreachProofPassword('wrong', breachProofPassword, true);
      expect(verified).to.be.false;
    });
  });

  describe('Update', () => {
    const password = 'password';

    let updatedPythia: Pythia;
    let breachProofPassword: BreachProofPassword;

    before(async () => {
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
      updatedPythia = new Pythia({
        pythiaClient,
        pythiaCrypto,
        virgilCrypto,
        proofKeys: new ProofKeys(process.env.MY_PROOF_KEYS!.split(';')),
      });
      breachProofPassword = await pythia.createBreachProofPassword(password);
    });

    it('updates breach-proof password with update token', () => {
      const updatedBreachProofPassword = updatedPythia.updateBreachProofPassword(
        process.env.MY_UPDATE_TOKEN!,
        breachProofPassword,
      );
      expect(NodeBuffer.from(updatedBreachProofPassword.salt).equals(breachProofPassword.salt)).to
        .be.true;
      expect(
        NodeBuffer.from(updatedBreachProofPassword.deblindedPassword).equals(
          breachProofPassword.deblindedPassword,
        ),
      ).to.be.false;
      expect(updatedBreachProofPassword.version).to.eql(2);
    });

    it('throws error when bpp is already migrated (YTC-18)', async () => {
      const breachProofPassword = await updatedPythia.createBreachProofPassword(password);
      const error = () => {
        updatedPythia.updateBreachProofPassword(process.env.MY_UPDATE_TOKEN!, breachProofPassword);
      };
      expect(error).to.throw;
    });

    it('throws error when bpp is has wrong version (YTC-19)', async () => {
      const breachProofPassword = await pythia.createBreachProofPassword(password);
      const error = () => {
        pythia.updateBreachProofPassword(
          'UT.2.3.AAbuM/+5MVKdFuJWO6wUB8cL78AFidIUd4XJp5Gq48Jc',
          breachProofPassword,
        );
      };
      expect(error).to.throw;
    });

    it('throws error when given invalid update token (YTC-20)', () => {
      const error = () => {
        updatedPythia.updateBreachProofPassword(
          'PK.2.3.AGnR4LLnbBIDoPxy3OftLiw4tqRYd0NtRlvsM4dH0hlT',
          breachProofPassword,
        );
      };
      expect(error).to.throw;
    });
  });

  describe('Authentication with updated password', () => {
    const password = 'password';

    let updatedPythia: Pythia;
    let updatedBreachProofPassword: BreachProofPassword;
    let originalBreachProofPassword: BreachProofPassword;

    before(async () => {
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
      updatedPythia = new Pythia({
        pythiaClient,
        pythiaCrypto,
        virgilCrypto,
        proofKeys: new ProofKeys(process.env.MY_PROOF_KEYS!.split(';')),
      });
      originalBreachProofPassword = await pythia.createBreachProofPassword(password);
      updatedBreachProofPassword = await updatedPythia.updateBreachProofPassword(
        process.env.MY_UPDATE_TOKEN!,
        originalBreachProofPassword,
      );
    });

    beforeEach(() => {
      return sleep(RATE_LIMIT);
    });

    it('verifies updated password without proof', async () => {
      const verified = await updatedPythia.verifyBreachProofPassword(
        password,
        updatedBreachProofPassword,
        false,
      );
      expect(verified).to.be.true;
    });

    it('verifies updated password with proof', async () => {
      const verified = await updatedPythia.verifyBreachProofPassword(
        password,
        updatedBreachProofPassword,
        true,
      );
      expect(verified).to.be.true;
    });

    it('verifies original password (YTC-17)', async () => {
      const verified = await updatedPythia.verifyBreachProofPassword(
        password,
        originalBreachProofPassword,
        false,
      );
      expect(verified).to.be.true;
    });

    it('creates new passwords with new version (YTC-14)', async () => {
      const newBreachProofPassword = await updatedPythia.createBreachProofPassword(password);
      expect(newBreachProofPassword.version).to.eql(2);
    });
  });
});
