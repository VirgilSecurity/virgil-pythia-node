import { createVirgilCrypto, VirgilAccessTokenSigner } from 'virgil-crypto/dist/virgil-crypto-pythia.cjs';
import { JwtGenerator, GeneratorJwtProvider } from 'virgil-sdk';
import { ProofKeys } from './ProofKeys';
import { Pythia } from './Pythia';
import { PythiaClient } from '../client/PythiaClient';
import { VirgilPythiaCrypto } from '../crypto/VirgilPythiaCrypto';

const PYTHIA_CLIENT_IDENTITY = 'PYTHIA-CLIENT';
const ONE_HOUR = 60 * 60 * 1000;

export function createPythia(params) {
	const { apiKeyBase64, apiKeyId, appId, proofKeys, apiUrl } = params;

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

	return new Pythia({
		proofKeys: new ProofKeys(proofKeys),
		accessTokenProvider: new GeneratorJwtProvider(generator, undefined, PYTHIA_CLIENT_IDENTITY),
		client: new PythiaClient(apiUrl),
		pythiaCrypto: new VirgilPythiaCrypto(crypto)
	});
}
