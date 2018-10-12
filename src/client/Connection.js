import { default as fetch, Headers } from 'cross-fetch';
import { PythiaClientError } from '../errors/errors';

/**
 * Class responsible for sending HTTP requests to
 * Virgil Pythia service.
 *
 * @hidden
 */
export class Connection {
	constructor (baseUrl) {
		this.baseUrl = baseUrl;
	}

	send (url, opts) {
		opts = normalizeOptions(opts);
		return fetch(this.baseUrl + url, opts).then(response => {
			if (!response.ok) {
				return response.json().then(reason => {
					const message = reason.message || response.statusText;
					throw new PythiaClientError(message, reason.code, response.status);
				});

			}

			return response.json();
		});
	}
}

function normalizeOptions(opts) {
	opts = Object.assign({}, opts);

	let headers = new Headers(opts.headers || { });
	if (opts.accessToken && !headers.has('Authorization')) {
		headers.set('Authorization', `Virgil ${opts.accessToken}`);
		delete opts.accessToken;
	}

	opts.headers = headers;

	if (opts.body) {
		const json = JSON.stringify(opts.body);
		if (!headers.has('Content-Type')) {
			headers.set('Content-Type', 'application/json');
		}

		opts.body = json;
		opts.method = (opts.method || 'POST').toUpperCase();
	} else {
		opts.method = (opts.method || 'GET').toUpperCase();
	}

	return opts;
}

