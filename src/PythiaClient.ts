import axios, { AxiosInstance } from 'axios';
import { Buffer as NodeBuffer } from 'buffer';

import { IPythiaClient } from './IPythiaClient';
import { IAccessTokenProvider } from './types';

interface GenerateSeedRequestBody {
  blinded_password: string;
  brainkey_id?: string;
}

export class PythiaClient implements IPythiaClient {
  private static readonly DEFAULT_URL = 'https://api.virgilsecurity.com';

  private readonly accessTokenProvider: IAccessTokenProvider;
  private readonly axios: AxiosInstance;

  constructor(accessTokenProvider: IAccessTokenProvider, apiUrl?: string) {
    if (accessTokenProvider == null) {
      throw new Error('`accessTokenProvider` is required');
    }
    this.accessTokenProvider = accessTokenProvider;
    this.axios = axios.create({ baseURL: apiUrl || PythiaClient.DEFAULT_URL });
  }

  async generateSeed(blindedPassword: Uint8Array, brainKeyId?: string) {
    const body: GenerateSeedRequestBody = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      blinded_password: NodeBuffer.from(blindedPassword).toString('base64'),
    };
    if (brainKeyId) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      body.brainkey_id = brainKeyId;
    }
    const accessToken = await this.accessTokenProvider.getToken({
      service: 'pythia',
      operation: 'seed',
    });
    const {
      data: { seed },
    } = await this.axios.post('/pythia/v1/brainkey', body, {
      headers: {
        Authorization: `Virgil ${accessToken}`,
      },
    });
    return NodeBuffer.from(seed, 'base64');
  }
}
