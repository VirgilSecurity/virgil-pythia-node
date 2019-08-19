// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPythiaClient {
  generateSeed(blindedPassword: Uint8Array, brainKeyId?: string): Promise<Uint8Array>;
}
