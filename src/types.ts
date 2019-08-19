export enum StringEncoding {
  utf8 = 'utf8',
  base64 = 'base64',
  hex = 'hex',
}

export type Data = import('virgil-crypto').Data;
export type IPrivateKey = import('virgil-crypto').IPrivateKey;
export type IPublicKey = import('virgil-crypto').IPublicKey;

export type IAccessTokenProvider = import('virgil-sdk').IAccessTokenProvider;
