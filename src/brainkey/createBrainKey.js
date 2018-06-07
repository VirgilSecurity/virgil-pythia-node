import {
	createVirgilCrypto,
	VirgilAccessTokenSigner,
	KeyPairType
} from 'virgil-crypto/dist/virgil-crypto-pythia.cjs';
import { JwtGenerator, GeneratorJwtProvider } from 'virgil-sdk';
import { PythiaClient } from '../client/PythiaClient';
import { VirgilPythiaCrypto } from '../crypto/VirgilPythiaCrypto';
import { BrainKey } from './BrainKey';

const PYTHIA_CLIENT_IDENTITY = 'PYTHIA-CLIENT';
const ONE_HOUR = 60 * 60 * 1000;

/**
 * Factory function to create instances of {@link BrainKey} class.
 *
 * @param params - Dependencies needed for `BrainKey`.
 *
 * @returns {BrainKey}
 */
export function createBrainKey(params) {
	const { apiKeyBase64, apiKeyId, appId, apiUrl, keyPairType = KeyPairType.Default } = params;

	const crypto = createVirgilCrypto();
	const accessTokenSigner = new VirgilAccessTokenSigner(crypto);
	const apiKey = crypto.importPrivateKey(apiKeyBase64);
	const generator = new JwtGenerator({
		apiKey,
		apiKeyId,
		appId,
		accessTokenSigner,
		millisecondsToLive: ONE_HOUR
	});

	return new BrainKey({
		keyPairType,
		accessTokenProvider: new GeneratorJwtProvider(generator, undefined, PYTHIA_CLIENT_IDENTITY),
		client: new PythiaClient(apiUrl),
		pythiaCrypto: new VirgilPythiaCrypto(crypto)
	});
}
