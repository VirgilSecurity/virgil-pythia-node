/**
 * Pythia BrainKey.
 *
 * BrainKey instances are not meant to be created with the `new` keyword. Use
 * the {@link createBrainKey} function to instantiate a `BrainKey`.
 */
export class BrainKey {
	/**
	 * Initializes a new instance of `BrainKey`.
	 *
	 * @protected
	 *
	 * @param client - The service client.
	 * @param accessTokenProvider - The access token provider.
	 * @param pythiaCrypto - Crypto operations provider.
	 * @param keyPairType - Type of key pair to generate.
	 */
	constructor ({ client, accessTokenProvider, virgilCrypto, virgilPythiaCrypto, keyPairType }) {
		this.client = client;
		this.accessTokenProvider = accessTokenProvider;
		this.keyPairType = keyPairType;
		this.virgilCrypto = virgilCrypto;
		this.virgilPythiaCrypto = virgilPythiaCrypto;
	}

	/**
	 * Asynchronously generates an asymmetric key pair based on the given
	 * `password` and `brainKeyId`.
	 *
	 * @param password - The password to generate the key pair from.
	 * @param brainKeyId - Optional brainKey identifier. Used when one needs
	 * to generate several different key pairs from the single password.
	 *
	 * @returns {Promise<{ privateKey: IPrivateKey, publicKey: IPublicKey }>}
	 */
	generateKeyPair (password, brainKeyId) {
		const { blindedPassword, blindingSecret } = this.virgilPythiaCrypto.blind(password);
		return this.accessTokenProvider.getToken(makeTokenContext()).then(accessToken =>
			this.client.generateSeed({
				blindedPassword,
				brainKeyId,
				token: accessToken.toString()
			})
		).then(seed => {
			const deblindedPassword = this.virgilPythiaCrypto.deblind({
				transformedPassword: seed,
				blindingSecret
			});
			return this.virgilCrypto.generateKeysFromKeyMaterial(deblindedPassword, this.keyPairType);
		});
	}
}

export function makeTokenContext () {
	return {
		service: 'pythia',
		operation: 'seed',
		forceReload: false
	};
}
