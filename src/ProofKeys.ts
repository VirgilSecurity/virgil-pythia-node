import { Buffer as NodeBuffer } from 'buffer';

import { toArray } from './utils';

interface ProofKey {
  version: number;
  key: Uint8Array;
}

export class ProofKeys {
  private readonly proofKeys: ProofKey[];

  constructor(proofKeys: string | string[]) {
    const myProofKeys = toArray<string>(proofKeys);
    if (!myProofKeys.length) {
      throw new Error('`proofKeys` must not be empty');
    }
    this.proofKeys = myProofKeys.map(this.parseProofKey).sort(this.compareProofKeyVersions);
  }

  currentKey() {
    if (this.proofKeys[0] === undefined) {
      throw new Error('No proof key exists');
    }
    return this.proofKeys[0];
  }

  proofKey(version: number) {
    const proofKey = this.proofKeys.find(proofKey => proofKey.version === version);
    if (proofKey === undefined) {
      throw new Error(`Proof key of version ${version} does not exist`);
    }
    return proofKey;
  }

  private parseProofKey(proofKey: string): ProofKey {
    const parts = proofKey.split('.');
    if (parts.length !== 3 || parts[0] !== 'PK') {
      throw new TypeError('`proofKey` format is invalid');
    }
    const version = Number(parts[1]);
    const key = NodeBuffer.from(parts[2], 'base64');
    return { version, key };
  }

  private compareProofKeyVersions(proofKey1: ProofKey, proofKey2: ProofKey) {
    return proofKey2.version - proofKey1.version;
  }
}
