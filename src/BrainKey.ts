import { IPythiaClient } from './IPythiaClient';
import { IPythiaCrypto } from './IPythiaCrypto';
import { PythiaClient } from './PythiaClient';
import { PythiaCrypto } from './PythiaCrypto';
import { VirgilCrypto, Data, IAccessTokenProvider } from './types';
import { dataToUint8Array } from './utils';

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

  static create(virgilCrypto: VirgilCrypto, accessTokenProvider: IAccessTokenProvider) {
    const pythiaCrypto = new PythiaCrypto(virgilCrypto);
    const pythiaClient = new PythiaClient(accessTokenProvider);
    return new BrainKey(pythiaCrypto, pythiaClient);
  }

  async generateKeyPair(password: Data, brainKeyId?: string) {
    const myPassword = dataToUint8Array(password, 'utf8');
    const { blindedPassword, blindingSecret } = this.pythiaCrypto.blind(myPassword);
    const seed = await this.pythiaClient.generateSeed(blindedPassword, brainKeyId);
    const deblindedPassword = this.pythiaCrypto.deblind(seed, blindingSecret);
    return this.pythiaCrypto.generateKeyPair(deblindedPassword);
  }
}
