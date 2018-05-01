import { default as fetch, Headers } from 'node-fetch';

export class Connection {
	constructor (baseUrl) {
		this.baseUrl = baseUrl;
	}

	send (url, opts) {
		opts = normalizeOptions(opts);
		return fetch(this.baseUrl + url, opts);
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

