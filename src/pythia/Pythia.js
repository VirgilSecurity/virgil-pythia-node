import { BreachProofPassword } from './BreachProofPassword';

export class Pythia {
	constructor(params) {
		const { proofKeys, accessTokenProvider, client, pythiaCrypto } = params;
		this.proofKeys = proofKeys;
		this.accessTokenProvider = accessTokenProvider;
		this.client = client;
		this.pythiaCrypto = pythiaCrypto;
	}

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

function constantTimeEqual (buf1, buf2) {
	if (!(Buffer.isBuffer(buf1) && Buffer.isBuffer(buf2))) {
		throw new Error(
			'Only Buffer instances can be checked for equality'
		);
	}

	if (buf1.byteLength !== buf2.byteLength) {
		throw new Error('Both buffers must be of the same length');
	}

	let equal = 0;
	for (let i = 0; i < buf1.length; i++) {
		equal |= buf1[i] ^ buf2[i];
	}

	return equal === 0;
}
