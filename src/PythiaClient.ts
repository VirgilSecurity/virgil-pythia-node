import axios from 'axios';
import { VirgilAgent } from 'virgil-sdk';

import { PythiaError, PythiaClientError } from './errors';
import { IPythiaClient, TransformPasswordResult } from './IPythiaClient';
import { AxiosError, IAccessTokenProvider, IAccessToken } from './types';

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
  private readonly virgilAgent: VirgilAgent;

  constructor(
    accessTokenProvider: IAccessTokenProvider,
    apiUrl?: string,
    virgilAgent?: VirgilAgent,
  ) {
    if (accessTokenProvider == null) {
      throw new Error('`accessTokenProvider` is required');
    }
    this.accessTokenProvider = accessTokenProvider;
    this.axios = axios.create({ baseURL: apiUrl || PythiaClient.DEFAULT_URL });
    this.virgilAgent =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      virgilAgent || new VirgilAgent(process.env.PRODUCT_NAME!, process.env.PRODUCT_VERSION!);
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
      headers: PythiaClient.getHeaders(this.virgilAgent, accessToken),
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
      headers: PythiaClient.getHeaders(this.virgilAgent, accessToken),
    });
    const result: TransformPasswordResult = {
      // eslint-disable-next-line @typescript-eslint/camelcase
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

  private static getHeaders(virgilAgent: VirgilAgent, accessToken: IAccessToken) {
    return {
      Authorization: `Virgil ${accessToken.toString()}`,
      'Virgil-Agent': virgilAgent.value,
    };
  }

  private static onBadResponse(error: AxiosError) {
    if (error.response) {
      if (error.response.data) {
        const message = error.response.data.message || error.response.statusText;
        throw new PythiaClientError(message, error.response.data.code, error.response.status);
      }
      throw new PythiaClientError(error.response.statusText, undefined, error.response.status);
    }
    throw new PythiaError('Something bad happened. Please try again later.');
  }
}
