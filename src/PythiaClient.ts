import { Buffer as NodeBuffer } from '@virgilsecurity/data-utils';
import axios from 'axios';

import { IPythiaClient, TransformPasswordResult } from './IPythiaClient';
import { IAccessTokenProvider } from './types';

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
  }

  async generateSeed(blindedPassword: Buffer, brainKeyId?: string) {
    const body: GenerateSeedRequestBody = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      blinded_password: blindedPassword.toString('base64'),
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
    return NodeBuffer.from(seed, 'base64');
  }

  async transformPassword(options: {
    blindedPassword: Buffer;
    salt: Buffer;
    version?: number;
    includeProof?: boolean;
  }) {
    const body: TransformPasswordRequestBody = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      blinded_password: options.blindedPassword.toString('base64'),
      // eslint-disable-next-line @typescript-eslint/camelcase
      user_id: options.salt.toString('base64'),
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
      transformedPassword: NodeBuffer.from(transformed_password, 'base64'),
    };
    if (body.include_proof) {
      result.proof = {
        valueC: NodeBuffer.from(proof.value_c, 'base64'),
        valueU: NodeBuffer.from(proof.value_u, 'base64'),
      };
    }
    return result;
  }
}
