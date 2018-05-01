import { inherits } from 'util';

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


