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
		throw new Error('Not implemented');
	}

	updateUser(updateToken, pythiaUser) {
		throw new Error('Not implemented');
	}
}
