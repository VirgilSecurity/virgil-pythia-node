import { PythiaClient } from '../client/PythiaClient';
import { BrainKey } from './BrainKey';

/**
 * Factory function to create instances of {@link BrainKey} class.
 *
 * @param {Object} params - Dependencies needed for `BrainKey`.
 * @param {VirgilCrypto} params.virgilCrypto - Instance of `VirgilCrypto`
 * class from `virgil-crypto` module.
 * @param {VirgilPythiaCrypto} params.virgilPythiaCrypto - Instance of `VirgilPythiaCrypto`
 * class from `virgil-crypto` module.
 * @param {IAccessTokenProvider} params.accessTokenProvider - Object implementing
 * the `IAccessTokenProvider` interface from `virgil-sdk` module.
 * @param {string} [params.keyPairType] - Type of keys to generate. For available
 * options see `KeyPairType` enum in `virgil-crypto` module. Optional. The
 * recommended type is used by default.
 *
 * @returns {BrainKey}
 */
export function createBrainKey(params) {
	const {
		virgilCrypto,
		virgilPythiaCrypto,
		accessTokenProvider,
		keyPairType,
		apiUrl
	} = params;

	requiredArg(virgilCrypto, 'virgilCrypto');
	requiredArg(virgilPythiaCrypto, 'virgilPythiaCrypto');
	requiredArg(accessTokenProvider, 'accessTokenProvider');

	return new BrainKey({
		keyPairType,
		accessTokenProvider: accessTokenProvider,
		client: new PythiaClient(apiUrl),
		virgilCrypto,
		virgilPythiaCrypto
	});
}

function requiredArg(arg, argName) {
	if (arg == null) {
		throw new Error(`Invalid BrainKey parameters. "${argName}" is required.`);
	}
}
