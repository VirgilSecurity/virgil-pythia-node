import { toArray } from '../utils/toArray';

/**
 * Represents cryptographic public keys with versions, which are
 * used to verify the result of `transform` operation.
 *
 * @hidden
 */
export class ProofKeys {

	/**
	 * Creates a new instance of `ProofKeys`.
	 * @param {string|string[]} proofKeys - Array of strings (or a single string)
	 * representing the Pythia public key(s). String must be in the following format:
	 * 		`'PK.{version}.{base64-encoded-data}'`
	 *
	 * If `proofKeys` is empty or contains string in a wrong format, an error is thrown.
	 */
	constructor(proofKeys) {
		proofKeys = toArray(proofKeys);

		if (proofKeys.length === 0) {
			throw new Error('Parameter `proofKeys` must not be empty');
		}

		this.proofKeys = proofKeys.map(parseProofKey).sort(compareVersion);
	}

	/**
	 * Retrieves the current Pythia public key.
	 * @returns {{ version: number, key: Buffer }}
	 */
	currentKey() {
		if (this.proofKeys[0] === undefined) {
			// Something very bad has happened. Probably, unsuccessful migration
			throw new Error('No proof key exists');
		}

		return this.proofKeys[0];
	}

	/**
	 * Retrieves a Pythia public key by `version`.
	 * @param {number} version - Version of the public key to retrieve.
	 * @returns {{ version: number, key: Buffer }}
	 */
	proofKey(version) {
		const proofKey = this.proofKeys.find(k => k.version === version);
		if (proofKey === undefined) {
			// Something very bad has happened. Probably, unsuccessful migration
			throw new Error(`Proof key of version ${version} does not exist`);
		}

		return proofKey;
	}
}

function compareVersion(proofKeyA, proofKeyB) {
	// sort in descending order
	return proofKeyB.version - proofKeyA.version;
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
