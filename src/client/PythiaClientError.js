/**
 * An error thrown when an HTTP request to the Virgil API fails.
 * @param message - Error message
 * @param code - Optional error code.
 * @param httpStatus - HTTP status of the failed request.
 * @constructor
 */
function PythiaClientError(message, code, httpStatus) {
	this.message = message;
	this.code = code;
	this.httpStatus = httpStatus;
	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, this.constructor);
	} else {
		this.stack = (new Error()).stack;
	}
}

PythiaClientError.prototype = Object.create(Error.prototype);
PythiaClientError.prototype.name = 'PythiaClientError';
PythiaClientError.prototype.constructor = PythiaClientError;


export { PythiaClientError };


