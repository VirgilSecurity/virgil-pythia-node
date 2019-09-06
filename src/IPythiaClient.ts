export interface TransformPasswordResult {
  transformedPassword: string;
  proof?: {
    valueC: string;
    valueU: string;
  };
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPythiaClient {
  generateSeed(blindedPassword: string, brainKeyId?: string): Promise<string>;
  transformPassword(options: {
    blindedPassword: string;
    salt: string;
    version?: number;
    includeProof?: boolean;
  }): Promise<TransformPasswordResult>;
}
