import { toArray } from '../utils/toArray';

export class ProofKeys {
	constructor(proofKeys) {
		proofKeys = toArray(proofKeys);

		if (proofKeys == null || proofKeys.length === 0) {
			throw new Error('Parameter `proofKeys` must not be empty');
		}

		this.proofKeys = proofKeys.map(parseProofKey);
	}

	currentKey() {
		if (this.proofKeys[0] === undefined) {
			// Something very bad has happened. Probably, unsuccessful migration
			throw new Error('No proof key exists');
		}

		return this.proofKeys[0];
	}

	proofKey(version) {
		const proofKey = this.proofKeys.find(k => k.version === version);
		if (proofKey === undefined) {
			throw new Error(`Proof key of version ${version} does not exist`);
		}

		return proofKey;
	}
}

function parseProofKey(str) {
	const parts = str.split('.');
	if (parts.length !== 3 || parts[0] !== 'PK') {
		throw new Error('ProofKey string is invalid');
	}

	const version = Number(parts[1]);
	const key = Buffer.from(parts[2], 'base64');

	return {
		version,
		key
	};
}
