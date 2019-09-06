export class PythiaError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'PythiaError';
  }
}

export class PythiaClientError extends PythiaError {
  readonly code: number;
  readonly httpStatus: number;

  constructor(message: string, code: number, httpStatus: number) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export class ProofVerificationFailedError extends PythiaError {
  constructor() {
    super('Transformed password proof verification has failed');
    this.name = 'ProofVerificationFailedError';
  }
}

export class UnexpectedBreachProofPasswordVersionError extends PythiaError {
  constructor(expectedVersion: number, actualVersion: number) {
    super(
      `Unexpected Breach-proof password version. Expected ${expectedVersion}, got ${actualVersion}`,
    );
    this.name = 'UnexpectedBreachProofPasswordVersionError';
  }
}
