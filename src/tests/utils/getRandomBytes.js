import { randomBytes } from 'crypto';

export function getRandomBytes (length) {
	return randomBytes(length);
}
