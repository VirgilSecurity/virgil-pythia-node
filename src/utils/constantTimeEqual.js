/**
 * Checks whether two buffers are equal in constant time.
 *
 * @hidden
 *
 * @param buf1
 * @param buf2
 * @returns {boolean}
 */
export function constantTimeEqual (buf1, buf2) {
	if (!(Buffer.isBuffer(buf1) && Buffer.isBuffer(buf2))) {
		throw new Error(
			'Only Buffer instances can be checked for equality'
		);
	}

	if (buf1.byteLength !== buf2.byteLength) {
		throw new Error('Both buffers must be of the same length');
	}

	let equal = 0;
	for (let i = 0; i < buf1.length; i++) {
		equal |= buf1[i] ^ buf2[i];
	}

	return equal === 0;
}
