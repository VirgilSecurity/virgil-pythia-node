import { PythiaClient } from '../client/PythiaClient';
import { VirgilPythiaCrypto } from '../crypto/VirgilPythiaCrypto';
import { BrainKey } from './BrainKey';

/**
 * Factory function to create instances of {@link BrainKey} class.
 *
 * @param {Object} params - Dependencies needed for `BrainKey`.
 * @param {VirgilCrypto} params.virgilCrypto - Instance of `VirgilCrypto`
 * class form `virgil-crypto` module.
 * @param {VirgilPythia} params.virgilPythia - Instance of `VirgilPythia`
 * class form `virgil-crypto` module.
 * @param {IAccessTokenProvider} params.accessTokenProvider - Object implementing
 * the `IAccessTokenProvider` interface form `virgil-sdk` module.
 * @param {string} [params.keyPairType] - Type of keys to generate. For available
 * options see `KeyPairType` enum in `virgil-crypto` module. Optional. The
 * recommended type is used by default.
 *
 * @returns {BrainKey}
 */
export function createBrainKey(params) {
	const {
		virgilCrypto,
		virgilPythia,
		accessTokenProvider,
		keyPairType,
		apiUrl
	} = params;

	requiredArg(virgilCrypto, 'virgilCrypto');
	requiredArg(virgilPythia, 'virgilPythia');
	requiredArg(accessTokenProvider, 'accessTokenProvider');

	return new BrainKey({
		keyPairType,
		accessTokenProvider: accessTokenProvider,
		client: new PythiaClient(apiUrl),
		pythiaCrypto: new VirgilPythiaCrypto(virgilCrypto, virgilPythia)
	});
}

function requiredArg(arg, argName) {
	if (arg == null) {
		throw new Error(`Invalid BrainKey parameters. "${argName}" is required.`);
	}
}
