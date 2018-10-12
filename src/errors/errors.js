function PythiaError(message) {
	this.message = message;
	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, this.constructor);
	} else {
		this.stack = (new Error()).stack;
	}
}

PythiaError.prototype = Object.create(Error.prototype);
PythiaError.prototype.name = 'PythiaError';
PythiaError.prototype.constructor = PythiaError;

/**
 * An error thrown when an HTTP request to the Virgil API fails.
 * @param message - Error message
 * @param code - Optional error code.
 * @param httpStatus - HTTP status of the failed request.
 * @constructor
 */
export class PythiaClientError extends PythiaError {
	constructor(message, code, httpStatus) {
		super(message);
		this.code = code;
		this.httpStatus = httpStatus;
	}
}

/**
 * An error thrown when server-provided cryptographic proof of correctness
 * of transformed password cannot be verified.
 */
export class ProofVerificationFailedError extends PythiaError {
	constructor() {
		super('Transformed password proof verification has failed');
		this.name = 'ProofVerificationFailedError';
	}
}

/**
 * An error thrown when updating a breach-proof password with an update token
 * and the password's version doesn't match the `from` version in update token.
 */
export class UnexpectedBreachProofPasswordVersionError extends PythiaError {
	constructor(expectedVersion, actualVersion) {
		super(
			`Unexpected Breach-proof password version. Expected ${
				expectedVersion
			}, got ${
				actualVersion
			}`
		);
		this.name = 'UnexpectedBreachProofPasswordVersionError';
	}
}
