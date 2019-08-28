/// <reference types="node" />

export interface TransformPasswordResult {
  transformedPassword: Buffer;
  proof?: {
    valueC: Buffer;
    valueU: Buffer;
  };
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPythiaClient {
  generateSeed(blindedPassword: Buffer, brainKeyId?: string): Promise<Buffer>;
  transformPassword(options: {
    blindedPassword: Buffer;
    salt: Buffer;
    version?: number;
    includeProof?: boolean;
  }): Promise<TransformPasswordResult>;
}
