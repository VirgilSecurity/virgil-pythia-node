export const constantTimeEqual = (a: string, b: string) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;

  let mismatch = a.length === b.length ? 0 : 1;
  if (mismatch) {
    b = a;
  }

  for (let i = 0, il = a.length; i < il; ++i) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
};

export const toArray = <T>(val?: T | T[]): T[] => {
  return val == null ? [] : Array.isArray(val) ? val : [val];
};
