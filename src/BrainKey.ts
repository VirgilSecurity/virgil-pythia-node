import { IPythiaClient } from './IPythiaClient';
import { IPythiaCrypto } from './IPythiaCrypto';
import { Data } from './types';

export class BrainKey {
  private readonly pythiaCrypto: IPythiaCrypto;
  private readonly pythiaClient: IPythiaClient;
  private readonly keyPairType?: unknown;

  constructor(pythiaCrypto: IPythiaCrypto, pythiaClient: IPythiaClient, keyPairType?: unknown) {
    if (pythiaCrypto == null) {
      throw new Error('`pythiaCrypto` is required');
    }
    if (pythiaClient == null) {
      throw new Error('`pythiaClient` is required');
    }
    this.pythiaCrypto = pythiaCrypto;
    this.pythiaClient = pythiaClient;
    this.keyPairType = keyPairType;
  }

  async generateKeyPair(password: Data, brainKeyId?: string) {
    const { blindedPassword, blindingSecret } = this.pythiaCrypto.blind(password);
    const seed = await this.pythiaClient.generateSeed(blindedPassword, brainKeyId);
    const deblindedPassword = this.pythiaCrypto.deblind(seed, blindingSecret);
    return this.pythiaCrypto.generateKeyPair(deblindedPassword, this.keyPairType);
  }
}
