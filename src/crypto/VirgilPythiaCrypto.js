import { VirgilPythia } from 'virgil-crypto/dist/virgil-crypto-pythia.cjs';

const SALT_BYTE_LENGTH = 32;

/**
 * Implementation of Pythia crypto algorithms using Virgil Crypto library.
 */
export class VirgilPythiaCrypto {

	/**
	 * Creates a new instance of `VirgilPythiaCrypto`.
	 * @param virgilCrypto - The VirgilCrypto library.
	 */
	constructor (virgilCrypto) {
		if (virgilCrypto == null) throw new Error('`virgilCrypto` is required');

		this.virgilCrypto = virgilCrypto;
		this.virgilPythia = new VirgilPythia();
	}

	/**
	 * Blinds (i.e. obfuscates) the password.
	 *
	 * Turns the password into a pseudo-random string.
	 * Blinding is necessary to prevent third-parties form knowing the end user's
	 * password.
	 *
	 * @param {string | Buffer} password - The user's password.
	 * @returns {PythiaBlindResult}
	 */
	blind (password) {
		return this.virgilPythia.blind(password);
	}

	/**
	 * Deblinds the `transformedPassword` with the previously computed `blindingSecret`
	 * returned from {@link VirgilPythiaCrypto.blind} method.
	 *
	 * @param {PythiaDeblindParams} params - Input parameters.
	 *
	 * @returns {Buffer} - Deblinded password. This value is NOT equal to password
	 * and is zero-knowledge protected.
	 */
	deblind (params) {
		return this.virgilPythia.deblind(params);
	}

	/**
	 * Verifies the cryptographic proof that the output of `transform` is correct.
	 *
	 * @param {PythiaVerifyParams} params - Input parameters.
	 * @returns {boolean} - `true` if transformed password is correct, otherwise - `false`.
	 */
	verify (params) {
		return this.virgilPythia.verify(params);
	}

	/**
	 * Generates new `deblindedPassword` by updating the existing one with the `updateToken`.
	 *
	 * @param {PythiaUpdateDeblindedWithTokenParams} params - Input parameters.
	 * @returns {Buffer} The new `deblindedPassword`
	 */
	updateDeblinded (params) {
		return this.virgilPythia.updateDeblindedWithToken(params);
	}

	/**
	 * Generates a pseudo-random sequence of bytes that is used as a user identifier.
	 * @returns {Buffer}
	 */
	generateSalt () {
		return this.virgilCrypto.getRandomBytes(SALT_BYTE_LENGTH);
	}

	/**
	 * Generates key pair of the given `type` from the given `seed`.
	 * @param type - Type of the key pair to generate.
	 * @param seed - The seed to generate the key pair from.
	 * @returns {{ privateKey: IPrivateKey, publicKey: IPublicKey }}
	 */
	generateKeyPair ({ type, seed }) {
		if (seed == null) throw new Error('`seed` is required');

		return this.virgilCrypto.generateKeysFromKeyMaterial(seed, type);
	}
}
