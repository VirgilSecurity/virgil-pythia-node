import { blind, deblind, generateSalt, updateDeblindedWithToken, verify } from '../crypto';
import { BreachProofPassword } from './BreachProofPassword';

export class Pythia {
	constructor(params) {
		const { proofKeys, accessTokenProvider, client } = params;
		this.proofKeys = proofKeys;
		this.accessTokenProvider = accessTokenProvider;
		this.client = client;
	}

	verifyBreachProofPassword(password, breachProofPassword, includeProof) {
		const { blindedPassword, blindingSecret } = blind(password);
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
				const verified = verify(
					transformedPassword,
					blindedPassword,
					breachProofPassword.salt,
					proofKey.key,
					proof.valueC,
					proof.valueU
				);

				if (!verified) {
					throw new Error('Transformed password verification has failed');
				}
			}

			const deblindedPassword = deblind(transformedPassword, blindingSecret);
			return deblindedPassword.equals(breachProofPassword.deblindedPassword);
		});
	}

	createBreachProofPassword(password) {
		const salt = generateSalt();
		const { blindedPassword, blindingSecret } = blind(password);
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
			const verified = verify(
				transformedPassword,
				blindedPassword,
				salt,
				latestProofKey.key,
				proof.valueC,
				proof.valueU
			);

			if (!verified) {
				throw new Error('Transformed password verification has failed');
			}

			const deblindedPassword = deblind(transformedPassword, blindingSecret);
			return new BreachProofPassword(salt, deblindedPassword, latestProofKey.version);
		});
	}

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

		const newDeblindedPassword = updateDeblindedWithToken(breachProofPassword.deblindedPassword, token);
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
