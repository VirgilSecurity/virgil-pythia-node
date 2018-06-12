import { ProofKeys } from './ProofKeys';
import { Pythia } from './Pythia';
import { PythiaClient } from '../client/PythiaClient';
import { VirgilPythiaCrypto } from '../crypto/VirgilPythiaCrypto';

/**
 * Factory function used to create instances of {@link Pythia} class.
 * @param {Object} params - Dependencies needed for `Pythia`.
 * @param {VirgilCrypto} params.virgilCrypto - Instance of `VirgilCrypto`
 * class form `virgil-crypto` module.
 * @param {VirgilPythia} params.virgilPythia - Instance of `VirgilPythia`
 * class form `virgil-crypto` module.
 * @param {IAccessTokenProvider} params.accessTokenProvider - Object implementing
 * the `IAccessTokenProvider` interface form `virgil-sdk` module.
 * @param {string|string[]} params.proofKeys - The proof key or an array of proof keys in
 * string format. The format must be the following:
 * 		`'PK.{version}.{base64-encoded-data}'`
 *
 * @returns {Pythia}
 */
export function createPythia(params) {
	const {
		virgilCrypto,
		virgilPythia,
		accessTokenProvider,
		proofKeys,
		apiUrl
	} = params;

	requiredArg(virgilCrypto, 'virgilCrypto');
	requiredArg(virgilPythia, 'virgilPythia');
	requiredArg(accessTokenProvider, 'accessTokenProvider');
	requiredArg(proofKeys, 'proofKeys');

	return new Pythia({
		proofKeys: new ProofKeys(proofKeys),
		accessTokenProvider: accessTokenProvider,
		client: new PythiaClient(apiUrl),
		pythiaCrypto: new VirgilPythiaCrypto(virgilCrypto, virgilPythia)
	});
}

function requiredArg(arg, argName) {
	if (arg == null) {
		throw new Error(`Invalid Pythia parameters. "${argName}" is required.`);
	}
}
