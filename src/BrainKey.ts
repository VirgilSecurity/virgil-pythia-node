import { IPythiaClient } from './IPythiaClient';
import { IPythiaCrypto } from './IPythiaCrypto';
import { PythiaClient } from './PythiaClient';
import { PythiaCrypto } from './PythiaCrypto';
import { ICrypto, Data, IAccessTokenProvider } from './types';

export class BrainKey {
  private readonly pythiaCrypto: IPythiaCrypto;
  private readonly pythiaClient: IPythiaClient;

  constructor(pythiaCrypto: IPythiaCrypto, pythiaClient: IPythiaClient) {
    if (pythiaCrypto == null) {
      throw new Error('`pythiaCrypto` is required');
    }
    if (pythiaClient == null) {
      throw new Error('`pythiaClient` is required');
    }
    this.pythiaCrypto = pythiaCrypto;
    this.pythiaClient = pythiaClient;
  }

  static create(crypto: ICrypto, accessTokenProvider: IAccessTokenProvider) {
    const pythiaCrypto = new PythiaCrypto(crypto);
    const pythiaClient = new PythiaClient(accessTokenProvider);
    return new BrainKey(pythiaCrypto, pythiaClient);
  }

  async generateKeyPair(password: Data, brainKeyId?: string) {
    const { blindedPassword, blindingSecret } = this.pythiaCrypto.blind(password);
    const seed = await this.pythiaClient.generateSeed(blindedPassword, brainKeyId);
    const deblindedPassword = this.pythiaCrypto.deblind(seed, blindingSecret);
    return this.pythiaCrypto.generateKeyPair(deblindedPassword);
  }
}
