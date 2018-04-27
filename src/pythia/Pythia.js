import { blind, deblind, generateSalt, verify } from '../crypto';
import { PythiaUser } from './PythiaUser';

export class Pythia {
	constructor(params) {
		const { proofKeys, accessTokenProvider, client } = params;
		this.proofKeys = proofKeys;
		this.accessTokenProvider = accessTokenProvider;
		this.client = client;
	}

	authenticate(password, pythiaUser, prove = false) {
		throw new Error('Not implemented');
	}

	register(password) {
		const salt = generateSalt();
		const { blindedPassword, blindingSecret } = blind(password);
		const latestProofKey = this.proofKeys.currentKey();

		const tokenContext = { service: 'pythia', operation: 'transform', forceReload: false };
		return this.accessTokenProvider.getToken(tokenContext).then(accessToken =>
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
		throw new Error('Not implemented');
	}
}
