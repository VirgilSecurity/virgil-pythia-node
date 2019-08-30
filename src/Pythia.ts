import { NodeBuffer, dataToUint8Array } from '@virgilsecurity/data-utils';

import { BreachProofPassword } from './BreachProofPassword';
import { IPythiaClient } from './IPythiaClient';
import { ProofKeys } from './ProofKeys';
import { Data, ICrypto, IPythiaCrypto } from './types';
import { constantTimeEqual } from './utils';

export class Pythia {
  static SALT_BYTE_LENGTH = 32;

  private readonly crypto: ICrypto;
  private readonly proofKeys: ProofKeys;
  private readonly pythiaClient: IPythiaClient;
  private readonly pythiaCrypto: IPythiaCrypto;

  constructor(options: {
    crypto: ICrypto;
    proofKeys: ProofKeys;
    pythiaClient: IPythiaClient;
    pythiaCrypto: IPythiaCrypto;
  }) {
    this.crypto = options.crypto;
    this.proofKeys = options.proofKeys;
    this.pythiaClient = options.pythiaClient;
    this.pythiaCrypto = options.pythiaCrypto;
  }

  async verifyBreachProofPassword(
    password: Data,
    breachProofPassword: BreachProofPassword,
    includeProof?: boolean,
  ) {
    const myPassword = dataToUint8Array(password, 'utf8');
    const { blindedPassword, blindingSecret } = this.pythiaCrypto.blind(myPassword);
    const proofKey = this.proofKeys.proofKey(breachProofPassword.version);
    const { transformedPassword, proof } = await this.pythiaClient.transformPassword({
      blindedPassword,
      includeProof,
      salt: breachProofPassword.salt,
      version: breachProofPassword.version,
    });
    if (includeProof) {
      const verified = this.pythiaCrypto.verify({
        transformedPassword,
        blindedPassword,
        tweak: breachProofPassword.salt,
        transformationPublicKey: proofKey.key,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        proofValueC: proof!.valueC,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        proofValueU: proof!.valueU,
      });
      if (!verified) {
        throw new Error('Transformed password proof verification has failed');
      }
    }
    const deblindedPassword = this.pythiaCrypto.deblind({ transformedPassword, blindingSecret });
    return constantTimeEqual(deblindedPassword, breachProofPassword.deblindedPassword);
  }

  async createBreachProofPassword(password: Data) {
    const salt = this.crypto.getRandomBytes(Pythia.SALT_BYTE_LENGTH);
    const myPassword = dataToUint8Array(password, 'utf8');
    const { blindedPassword, blindingSecret } = this.pythiaCrypto.blind(myPassword);
    const latestProofKey = this.proofKeys.currentKey();
    const { transformedPassword, proof } = await this.pythiaClient.transformPassword({
      blindedPassword,
      salt,
      version: latestProofKey.version,
      includeProof: true,
    });
    const verified = this.pythiaCrypto.verify({
      transformedPassword,
      blindedPassword,
      tweak: salt,
      transformationPublicKey: latestProofKey.key,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      proofValueC: proof!.valueC,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      proofValueU: proof!.valueU,
    });
    if (!verified) {
      throw new Error('Transformed password proof verification has failed');
    }
    const deblindedPassword = this.pythiaCrypto.deblind({ transformedPassword, blindingSecret });
    return new BreachProofPassword(salt, deblindedPassword, latestProofKey.version);
  }

  updateBreachProofPassword(updateToken: string, breachProofPassword: BreachProofPassword) {
    const { prevVersion, nextVersion, token } = this.parseUpdateToken(updateToken);
    if (breachProofPassword.version !== prevVersion) {
      throw new Error('Unexpected breach-proof password version');
    }
    const deblindedPassword = this.pythiaCrypto.updateDeblindedWithToken({
      deblindedPassword: breachProofPassword.deblindedPassword,
      updateToken: token,
    });
    return new BreachProofPassword(breachProofPassword.salt, deblindedPassword, nextVersion);
  }

  private parseUpdateToken(updateToken: string) {
    const parts = updateToken.split('.');
    if (parts.length !== 4 || parts[0] !== 'UT') {
      throw new TypeError('`updateToken` format is invalid');
    }
    return {
      prevVersion: Number(parts[1]),
      nextVersion: Number(parts[2]),
      token: NodeBuffer.from(parts[3], 'base64'),
    };
  }
}
