import { NodeBuffer } from './types';

export interface TransformPasswordResult {
  transformedPassword: NodeBuffer;
  proof?: {
    valueC: NodeBuffer;
    valueU: NodeBuffer;
  };
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPythiaClient {
  generateSeed(blindedPassword: NodeBuffer, brainKeyId?: string): Promise<NodeBuffer>;
  transformPassword(options: {
    blindedPassword: NodeBuffer;
    salt: NodeBuffer;
    version?: number;
    includeProof?: boolean;
  }): Promise<TransformPasswordResult>;
}
