import { IPythiaClient } from './IPythiaClient';
import { Data, ICrypto, IBrainKeyCrypto } from './types';

export class BrainKey {
  private readonly crypto: ICrypto;
  private readonly brainKeyCrypto: IBrainKeyCrypto;
  private readonly pythiaClient: IPythiaClient;
  private readonly keyPairType?: unknown;

  constructor(options: {
    crypto: ICrypto;
    brainKeyCrypto: IBrainKeyCrypto;
    pythiaClient: IPythiaClient;
    keyPairType?: unknown;
  }) {
    this.crypto = options.crypto;
    this.brainKeyCrypto = options.brainKeyCrypto;
    this.pythiaClient = options.pythiaClient;
    this.keyPairType = options.keyPairType;
  }

  async generateKeyPair(password: Data, brainKeyId?: string) {
    const { blindedPassword, blindingSecret } = this.brainKeyCrypto.blind(password);
    const seed = await this.pythiaClient.generateSeed(blindedPassword.toString('base64'), brainKeyId);
    const deblindedPassword = this.brainKeyCrypto.deblind({
      blindingSecret,
      transformedPassword: seed,
    });
    return this.crypto.generateKeysFromKeyMaterial(deblindedPassword, this.keyPairType);
  }
}
