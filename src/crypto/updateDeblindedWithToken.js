import lib from '../../virgil_crypto_nodejs';
import { bufferToVirgilByteArray, virgilByteArrayToBuffer } from './utils';

export function updateDeblindedWithToken(deblindedPassword, passwordUpdateToken) {
	if (deblindedPassword == null) throw new Error('deblindedPassword is required');
	if (passwordUpdateToken == null) throw new Error('passwordUpdateToken is required');

	deblindedPassword = bufferToVirgilByteArray(deblindedPassword);
	passwordUpdateToken = bufferToVirgilByteArray(passwordUpdateToken);

	const pythia = new lib.VirgilPythia();
	const newDeblindedPassword = pythia.updateDeblindedWithToken(deblindedPassword, passwordUpdateToken);

	return virgilByteArrayToBuffer(newDeblindedPassword);
}
