/**
 * Represents a user's breach-proof password parameters.
 *
 * Instances of `BreachProofPassword` are not meant to be created with
 * the `new` keyword. Use {@link Pythia.createBreachProofPassword} to create
 * a `BreachProofPassword`.
 */
export class BreachProofPassword {

	/**
	 * Creates a new instance of `BreachProofPassword`.
	 *
	 * @protected
	 *
	 * @param {Buffer} salt - User identifier.
	 * @param {Buffer} deblindedPassword - Deblinded transformed password value.
	 * This value is not equal to password and is zero-knowledge protected.
	 * @param {number} version - The password version.
	 */
	constructor(salt, deblindedPassword, version) {
		this.salt = ensureBuffer(salt, 'salt');
		this.deblindedPassword = ensureBuffer(deblindedPassword, 'deblindedPassword');
		this.version = version;
	}

	/**
	 * Converts this instance to serializable JavaScript object.
	 * @returns {{ salt: string, deblindedPassword: string, version: number }}
	 */
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
