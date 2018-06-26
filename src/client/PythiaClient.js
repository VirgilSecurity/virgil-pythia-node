import { Connection } from './Connection';

/**
 * Virgil Pythia Service client.
 *
 * @hidden
 */
export class PythiaClient {

	/**
	 * Creates a new instance of `PythiaClient`.
	 * @param {string|Connection|null} apiUrl - Either the URL of the Virgil API
	 * Service, or a {@link Connection} instance, or `null`.
	 */
	constructor(apiUrl) {
		if (apiUrl == null) {
			this.connection = new Connection('https://api.virgilsecurity.com');
		} else if (typeof apiUrl === 'string') {
			this.connection = new Connection(apiUrl);
		} else {
			this.connection = apiUrl;
		}
	}

	/**
	 * Sends a request to transform the blinded password.
	 *
	 * @param {Object} params - Input parameters.
	 * @param {Buffer} params.salt - Arbitrary binary data identifying the user.
	 * @param {Buffer} params.blindedPassword - The obfuscated user password.
	 * @param {string} params.token - The access token to authenticate the request.
	 * @param {number} [params.version] - Version of the user's password.
	 * @param {boolean} [params.includeProof] - Indicates whether to include the cryptographic
	 * proof in the response.
	 *
	 * @returns {Promise<{ transformedPassword: Buffer, proof?: { valueC: Buffer, valueU: Buffer } }>}
	 */
	transformPassword (params) {
		const { salt, blindedPassword, token, version, includeProof } = params;
		const body = {
			blinded_password: blindedPassword.toString('base64'),
			user_id: salt.toString('base64')
		};

		if (version) {
			body.version = version;
		}

		if (includeProof) {
			body.include_proof = includeProof;
		}

		return this.connection.send(
			'/pythia/v1/password',
			{
				body,
				accessToken: token
			}
		).then(({ transformed_password, proof }) => {
			const result = {
				transformedPassword: Buffer.from(transformed_password, 'base64')
			};

			if (includeProof) {
				result.proof = {
					valueC: Buffer.from(proof.value_c, 'base64'),
					valueU: Buffer.from(proof.value_u, 'base64')
				};
			}

			return result;
		});
	}

	/**
	 * Sends a request to generate a pseudo-random value, that can be used as
	 * a seed for asymmetric key pair generation, from the blinded password.
	 * @param {Buffer} blindedPassword - The obfuscated user password.
	 * @param {string} [brainKeyId] - Optional identifier of the brain key.
	 * @param {string} token - The access token to authenticate the request.
	 * @returns {Promise<Buffer>}
	 */
	generateSeed ({ blindedPassword, brainKeyId, token }) {
		const body = {
			blinded_password: blindedPassword.toString('base64')
		};

		if (brainKeyId) {
			body.brainkey_id = brainKeyId;
		}

		return this.connection.send(
			'/pythia/v1/brainkey',
			{
				body,
				accessToken: token
			}
		).then(({ seed }) => Buffer.from(seed, 'base64'));
	}
}
