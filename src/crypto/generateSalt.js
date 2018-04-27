import lib from '../../virgil_crypto_nodejs';
import { virgilByteArrayToBuffer } from './utils';

export function generateSalt(numOfBytes = 32) {
	const random = new lib.VirgilRandom('');
	return virgilByteArrayToBuffer(random.randomize(numOfBytes));
}
