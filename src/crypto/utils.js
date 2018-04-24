import lib from '../../virgil_crypto_nodejs';

export function virgilByteArrayToBuffer(byteArray) {
	const size = byteArray.size();
	const buffer = new Buffer(size);

	for (let i = 0; i < size; ++i) {
		buffer[i] = byteArray.get(i);
	}

	return buffer;
}

export function bufferToVirgilByteArray(buffer) {
	const array = new lib.VirgilByteArray(buffer.byteLength);

	for (let i = 0; i < buffer.length; ++i) {
		array.set(i, buffer[i]);
	}

	return array;
}