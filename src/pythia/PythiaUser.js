export class PythiaUser {

	constructor(salt, deblindedPassword, version) {
		this.salt = ensureBuffer(salt, 'salt');
		this.deblindedPassword = ensureBuffer(deblindedPassword, 'deblindedPassword');
		this.version = version;
	}

	toJSON() {
		return {
			salt: this.salt.toString('base64'),
			deblindedPassword: this.deblindedPassword.toString('base64'),
			version: this.version
		};
	}
}

function ensureBuffer(arg, name) {
	if (Buffer.isBuffer(arg)) {
		return arg;
	}

	if (typeof arg === 'string') {
		return Buffer.from(arg, 'base64');
	}

	throw new TypeError(`Invalid argument '${name}'. Expected Buffer or string, got ${typeof arg}`);
}
