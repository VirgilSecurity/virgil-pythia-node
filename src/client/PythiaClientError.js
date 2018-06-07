import { inherits } from 'util';

/**
 * An error thrown when an HTTP request to the Virgil API fails.
 * @param message - Error message
 * @param code - Optional error code.
 * @param httpStatus - HTTP status of the failed request.
 * @constructor
 */
function PythiaClientError(message, code, httpStatus) {
	this.name = this.constructor.name;
	this.message = message;
	this.code = code;
	this.httpStatus = httpStatus;
	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, this.constructor);
	}
}

inherits(PythiaClientError, Error);

export { PythiaClientError };


