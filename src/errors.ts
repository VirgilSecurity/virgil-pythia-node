export class PythiaError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'PythiaError';
  }
}

export class PythiaClientError extends Error {
  readonly code?: number;
  readonly httpStatus?: number;

  constructor(message: string, code?: number, httpStatus?: number) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'PythiaClientError';
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export class ProofVerificationFailedError extends Error {
  constructor() {
    super('Transformed password proof verification has failed');
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'ProofVerificationFailedError';
  }
}

export class UnexpectedBreachProofPasswordVersionError extends Error {
  constructor(expectedVersion: number, actualVersion: number) {
    super(
      `Unexpected Breach-proof password version. Expected ${expectedVersion}, got ${actualVersion}`,
    );
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = 'UnexpectedBreachProofPasswordVersionError';
  }
}
