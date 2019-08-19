import { Buffer as NodeBuffer } from 'buffer';

import { Data, StringEncoding } from './types';

export const dataToUint8Array = (
  data: Data,
  defaultEncoding?: keyof typeof StringEncoding,
): Uint8Array => {
  if (typeof data === 'string') {
    return NodeBuffer.from(data, defaultEncoding);
  }
  if (data instanceof Uint8Array) {
    return data;
  }
  if (
    typeof data === 'object' &&
    typeof data.value === 'string' &&
    typeof StringEncoding[data.encoding] !== 'undefined'
  ) {
    return NodeBuffer.from(data.value, data.encoding);
  }
  throw new TypeError('Invalid format of Data');
};

export const toBuffer = (array: Uint8Array) => NodeBuffer.from(array.buffer);

export const constantTimeEqual = (array1: Uint8Array, array2: Uint8Array) => {
  if (!(array1 instanceof Uint8Array && array2 instanceof Uint8Array)) {
    throw new Error('Only Uint8Array instances can be checked for equality');
  }
  if (array1.byteLength !== array2.byteLength) {
    throw new Error('Both arrays must be of the same length');
  }
  let equal = 0;
  for (let i = 0; i < array1.length; i += 1) {
    equal |= array1[i] ^ array2[i];
  }
  return equal === 0;
};

export const toArray = <T>(val?: T | T[]): T[] => {
  return val == null ? [] : Array.isArray(val) ? val : [val];
};
