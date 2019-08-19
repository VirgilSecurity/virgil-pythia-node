export interface TransformPasswordResult {
  transformedPassword: Uint8Array;
  proof?: {
    valueC: Uint8Array;
    valueU: Uint8Array;
  };
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPythiaClient {
  generateSeed(blindedPassword: Uint8Array, brainKeyId?: string): Promise<Uint8Array>;
  transformPassword(options: {
    blindedPassword: Uint8Array;
    salt: Uint8Array;
    version?: number;
    includeProof?: boolean;
  }): Promise<TransformPasswordResult>;
}
