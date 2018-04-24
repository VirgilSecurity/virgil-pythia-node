import lib from '../../virgil_crypto_nodejs';
import { virgilByteArrayToBuffer } from './utils';

export function blind(password) {
	if (password == null) throw new Error('password is required');
	password = lib.VirgilByteArrayUtils.stringToBytes(password);
	const pythia = new lib.VirgilPythia();

	const result = pythia.blind(password);
	return {
		blindedPassword: virgilByteArrayToBuffer(result.blindedPassword()),
		blindingSecret: virgilByteArrayToBuffer(result.blindingSecret())
	};
}