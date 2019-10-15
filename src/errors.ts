export class PythiaError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, name: string = 'PythiaError', ParentClass: any = PythiaError) {
    super(message);
    Object.setPrototypeOf(this, ParentClass.prototype);
    this.name = name;
  }
}

export class PythiaClientError extends PythiaError {
  readonly code?: number;
  readonly httpStatus?: number;

  constructor(message: string, code?: number, httpStatus?: number) {
    super(message, 'PythiaClientError', PythiaClientError);
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

export class ProofVerificationFailedError extends PythiaError {
  constructor() {
    super(
      'Transformed password proof verification has failed',
      'ProofVerificationFailedError',
      ProofVerificationFailedError,
    );
  }
}

export class UnexpectedBreachProofPasswordVersionError extends PythiaError {
  constructor(expectedVersion: number, actualVersion: number) {
    super(
      `Unexpected Breach-proof password version. Expected ${expectedVersion}, got ${actualVersion}`,
      'UnexpectedBreachProofPasswordVersionError',
      UnexpectedBreachProofPasswordVersionError,
    );
  }
}
