import { Connection } from './Connection';
import { PythiaClientError } from './PythiaClientError';

export class PythiaClient {

	constructor(apiUrl) {
		if (apiUrl == null) {
			this.connection = new Connection('https://api.virgilsecurity.com');
		} else if (typeof apiUrl === 'string') {
			this.connection = new Connection(apiUrl);
		} else {
			this.connection = apiUrl;
		}
	}

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
		).then(response => {
			if (!response.ok) {
				return response.json().then(reason => {
					const message = reason.message || response.statusText;
					throw new PythiaClientError(message, reason.code, response.status);
				});

			}

			return response.json();
		}).then(({ transformed_password, proof }) => {
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
}
