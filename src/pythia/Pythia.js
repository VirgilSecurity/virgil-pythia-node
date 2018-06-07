import { BreachProofPassword } from './BreachProofPassword';
import { constantTimeEqual } from '../utils/constantTimeEqual';

/**
 * Class responsible generation, verification and updating of breach-proof passwords.
 *
 * `Pythia` instances are not meant to be created directly using the `new` keyword,
 * use {@link createPythia} method to create an instance.
 */
export class Pythia {

	/**
	 * Creates a new instance of `Pythia`.
	 * @param params - Pythia configuration.
	 */
	constructor(params) {
		const { proofKeys, accessTokenProvider, client, pythiaCrypto } = params;
		this.proofKeys = proofKeys;
		this.accessTokenProvider = accessTokenProvider;
		this.client = client;
		this.pythiaCrypto = pythiaCrypto;
	}

	/**
	 * Checks whether the given plaintext `password` corresponds to
	 * the given `breachProofPassword`.
	 *
	 * @param password - The plaintext password.
	 * @param breachProofPassword - The breach-proof password.
	 * @param [includeProof] - Indicates whether to instruct the Pythia Server to include
	 * the cryptographic proof that transformed blinded password was generated correctly.
	 * Default is `false`.
	 *
	 * @returns {Promise<boolean>} `true` if plaintext password corresponds to the
	 * breach-proof password, otherwise `false`.
	 */
	verifyBreachProofPassword(password, breachProofPassword, includeProof) {
		const { blindedPassword, blindingSecret } = this.pythiaCrypto.blind(password);
		const proofKey = this.proofKeys.proofKey(breachProofPassword.version);

		return this.accessTokenProvider.getToken(makeTokenContext()).then(accessToken =>
			this.client.transformPassword({
				blindedPassword,
				salt: breachProofPassword.salt,
				version: breachProofPassword.version,
				includeProof,
				token: accessToken.toString()
			})
		).then(({ transformedPassword, proof }) => {
			if (includeProof) {
				const verified = this.pythiaCrypto.verify({
					transformedPassword,
					blindedPassword,
					tweak: breachProofPassword.salt,
					transformationPublicKey: proofKey.key,
					proofValueC: proof.valueC,
					proofValueU: proof.valueU
				});

				if (!verified) {
					throw new Error('Transformed password verification has failed');
				}
			}

			const deblindedPassword = this.pythiaCrypto.deblind({ transformedPassword, blindingSecret });
			return constantTimeEqual(deblindedPassword, breachProofPassword.deblindedPassword);
		});
	}

	/**
	 * Creates a breach-proof password from the given plaintext `password`.
	 *
	 * @param password - The plaintext password.
	 *
	 * @returns {Promise<BreachProofPassword>}
	 */
	createBreachProofPassword(password) {
		const salt = this.pythiaCrypto.generateSalt();
		const { blindedPassword, blindingSecret } = this.pythiaCrypto.blind(password);
		const latestProofKey = this.proofKeys.currentKey();

		return this.accessTokenProvider.getToken(makeTokenContext()).then(accessToken =>
			this.client.transformPassword({
				blindedPassword,
				salt,
				version: latestProofKey.version,
				includeProof: true,
				token: accessToken.toString()
			})
		).then(({ transformedPassword, proof }) => {
			const verified = this.pythiaCrypto.verify({
				transformedPassword,
				blindedPassword,
				tweak: salt,
				transformationPublicKey: latestProofKey.key,
				proofValueC: proof.valueC,
				proofValueU: proof.valueU
			});

			if (!verified) {
				throw new Error('Transformed password verification has failed');
			}

			const deblindedPassword = this.pythiaCrypto.deblind({ transformedPassword, blindingSecret });
			return new BreachProofPassword(salt, deblindedPassword, latestProofKey.version);
		});
	}

	/**
	 * Generates a new breach-proof password based on the current `breachProofPassword`
	 * and `updateToken`.
	 *
	 * @param updateToken - The password update token. You can get it at Virgil Developer Dashboard.
	 * @param breachProofPassword - The current breach-proof password.
	 *
	 * @returns {BreachProofPassword} - The new breach-proof password.
	 */
	updateBreachProofPassword(updateToken, breachProofPassword) {
		const { prevVersion, nextVersion, token } = parseUpdateToken(updateToken);
		if (breachProofPassword.version === nextVersion) {
			throw new Error('Breach-proof password has already been migrated');
		}

		if (breachProofPassword.version !== prevVersion) {
			throw new Error(
				`Breach-proof password version is wrong. Expected ${prevVersion}, got ${breachProofPassword.version}`
			)
		}

		const newDeblindedPassword = this.pythiaCrypto.updateDeblinded({
			deblindedPassword: breachProofPassword.deblindedPassword,
			updateToken: token
		});
		return new BreachProofPassword(breachProofPassword.salt, newDeblindedPassword, nextVersion);
	}
}

function parseUpdateToken(updateToken) {
	const parts = updateToken.split('.');
	if (parts.length !== 4 || parts[0] !== 'UT') {
		throw new Error('UpdateToken string is invalid');
	}

	return {
		prevVersion: Number(parts[1]),
		nextVersion: Number(parts[2]),
		token: Buffer.from(parts[3], 'base64')
	};
}

function makeTokenContext() {
	return { service: 'pythia', operation: 'transform', forceReload: false };
}
