import { blind, deblind, generateSalt, updateDeblindedWithToken, verify } from '../crypto';
import { PythiaUser } from './PythiaUser';

export class Pythia {
	constructor(params) {
		const { proofKeys, accessTokenProvider, client } = params;
		this.proofKeys = proofKeys;
		this.accessTokenProvider = accessTokenProvider;
		this.client = client;
	}

	authenticate(password, pythiaUser, includeProof) {
		const { blindedPassword, blindingSecret } = blind(password);
		const proofKey = this.proofKeys.proofKey(pythiaUser.version);

		return this.accessTokenProvider.getToken(makeTokenContext()).then(accessToken =>
			this.client.transformPassword({
				blindedPassword,
				salt: pythiaUser.salt,
				version: pythiaUser.version,
				includeProof,
				token: accessToken.toString()
			})
		).then(({ transformedPassword, proof }) => {
			if (includeProof) {
				const verified = verify(
					transformedPassword,
					blindedPassword,
					pythiaUser.salt,
					proofKey.key,
					proof.valueC,
					proof.valueU
				);

				if (!verified) {
					throw new Error('Transformed password verification has failed');
				}
			}

			const deblindedPassword = deblind(transformedPassword, blindingSecret);
			return deblindedPassword.equals(pythiaUser.deblindedPassword);
		});
	}

	register(password) {
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
			return new PythiaUser(salt, deblindedPassword, latestProofKey.version);
		});
	}

	updateUser(updateToken, pythiaUser) {
		const { prevVersion, nextVersion, token } = parseUpdateToken(updateToken);
		if (pythiaUser.version === nextVersion) {
			throw new Error('This user\' password has already been migrated');
		}

		if (pythiaUser.version !== prevVersion) {
			throw new Error(
				`This user\' password version is incorrect. Expected ${prevVersion}, got ${pythiaUser.version}`
			)
		}

		const newDeblindedPassword = updateDeblindedWithToken(pythiaUser.deblindedPassword, token);
		return new PythiaUser(pythiaUser.salt, newDeblindedPassword, nextVersion);
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
