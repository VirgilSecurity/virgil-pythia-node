export enum StringEncoding {
  utf8 = 'utf8',
  base64 = 'base64',
  hex = 'hex',
}

export type PythiaModules = import('@virgilsecurity/core-pythia').PythiaModules;

export type Data = import('@virgilsecurity/data-utils').Data;

export type VirgilCrypto = import('virgil-crypto').VirgilCrypto;
export type IPrivateKey = import('virgil-crypto').IPrivateKey;
export type IPublicKey = import('virgil-crypto').IPublicKey;

export type IAccessTokenProvider = import('virgil-sdk').IAccessTokenProvider;
