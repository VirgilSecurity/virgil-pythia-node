export function getRandomBytes (length) {
	return Buffer.from(window.crypto.getRandomValues(new Uint8Array(length)).buffer);
}
