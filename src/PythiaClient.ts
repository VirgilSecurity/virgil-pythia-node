import axios from 'axios';

import { PythiaClientError } from './errors';
import { IPythiaClient, TransformPasswordResult } from './IPythiaClient';
import { AxiosResponse, IAccessTokenProvider } from './types';

type AxiosInstance = import('axios').AxiosInstance;

interface GenerateSeedRequestBody {
  blinded_password: string;
  brainkey_id?: string;
}

interface TransformPasswordRequestBody {
  blinded_password: string;
  user_id: string;
  version?: number;
  include_proof?: boolean;
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
    this.axios.interceptors.response.use(undefined, PythiaClient.onBadResponse);
  }

  async generateSeed(blindedPassword: string, brainKeyId?: string) {
    const body: GenerateSeedRequestBody = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      blinded_password: blindedPassword,
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
        Authorization: `Virgil ${accessToken.toString()}`,
      },
    });
    return seed;
  }

  async transformPassword(options: {
    blindedPassword: string;
    salt: string;
    version?: number;
    includeProof?: boolean;
  }) {
    const body: TransformPasswordRequestBody = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      blinded_password: options.blindedPassword,
      // eslint-disable-next-line @typescript-eslint/camelcase
      user_id: options.salt,
    };
    if (typeof options.version === 'number' && !Number.isNaN(options.version)) {
      body.version = options.version;
    }
    if (typeof options.includeProof === 'boolean') {
      // eslint-disable-next-line @typescript-eslint/camelcase
      body.include_proof = options.includeProof;
    }
    const accessToken = await this.accessTokenProvider.getToken({
      service: 'pythia',
      operation: 'password',
    });
    const {
      // eslint-disable-next-line @typescript-eslint/camelcase
      data: { transformed_password, proof },
    } = await this.axios.post('/pythia/v1/password', body, {
      headers: {
        Authorization: `Virgil ${accessToken.toString()}`,
      },
    });
    const result: TransformPasswordResult = {
      transformedPassword: transformed_password,
    };
    if (body.include_proof) {
      result.proof = {
        valueC: proof.value_c,
        valueU: proof.value_u,
      };
    }
    return result;
  }

  private static onBadResponse(response: AxiosResponse) {
    if (response.data) {
      const message = response.data.message || response.statusText;
      throw new PythiaClientError(message, response.data.code, response.status);
    }
    throw new PythiaClientError(response.statusText, undefined, response.status);
  }
}
