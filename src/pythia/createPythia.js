import { ProofKeys } from './ProofKeys';
import { Pythia } from './Pythia';
import { PythiaClient } from '../client/PythiaClient';

/**
 * Factory function used to create instances of {@link Pythia} class.
 * @param {Object} params - Dependencies needed for `Pythia`.
 * @param {VirgilCrypto} params.virgilCrypto - Instance of `VirgilCrypto`
 * class from `virgil-crypto` module.
 * @param {VirgilPythiaCrypto} params.virgilPythiaCrypto - Instance of `VirgilPythiaCrypto`
 * class from `virgil-crypto` module.
 * @param {IAccessTokenProvider} params.accessTokenProvider - Object implementing
 * the `IAccessTokenProvider` interface from `virgil-sdk` module.
 * @param {string|string[]} params.proofKeys - The proof key or an array of proof keys in
 * string format. The format must be the following:
 * 		`'PK.{version}.{base64-encoded-data}'`
 *
 * @returns {Pythia}
 */
export function createPythia(params) {
	const {
		virgilCrypto,
		virgilPythiaCrypto,
		accessTokenProvider,
		proofKeys,
		apiUrl
	} = params;

	requiredArg(virgilCrypto, 'virgilCrypto');
	requiredArg(virgilPythiaCrypto, 'virgilPythiaCrypto');
	requiredArg(accessTokenProvider, 'accessTokenProvider');
	requiredArg(proofKeys, 'proofKeys');

	return new Pythia({
		proofKeys: new ProofKeys(proofKeys),
		accessTokenProvider: accessTokenProvider,
		client: new PythiaClient(apiUrl),
		virgilCrypto,
		virgilPythiaCrypto
	});
}

function requiredArg(arg, argName) {
	if (arg == null) {
		throw new Error(`Invalid Pythia parameters. "${argName}" is required.`);
	}
}
