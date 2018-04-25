import { request } from 'https';
import { Connection } from './Connection';

export class PythiaClient {
	constructor(apiUrl, appId) {
		if (typeof apiUrl === 'string') {
			this.connection = new Connection(apiUrl);
		} else {
			this.connection = new Connection('https://api.virgilsecurity.com');
		}

		this.appId = appId;
	}

	async transformPassword (params) {
		const { salt, blindedPassword, version, token, includeProof } = params;
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

		const headers = {
			'X-Application-Id': this.appId
		};

		const response = await this.connection.send(
			'/pythia/v1/password',
			{
				headers,
				body,
				accessToken: token
			}
		);

		if (!response.ok) {
			// TODO throw custom error
			throw new Error(`HttpError: ${resposne.status} - ${resposne.statusText}`);
		}

		const { transformed_password, proof } = await response.json();
		return {
			transformedPassword: Buffer.from(transformed_password, 'base64'),
			proof: {
				valueC: Buffer.from(proof.value_c, 'base64'),
				valueU: Buffer.from(proof.value_u, 'base64')
			}
		};
	}
}
