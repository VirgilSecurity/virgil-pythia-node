import lib from '../../virgil_crypto_nodejs';
import { bufferToVirgilByteArray, virgilByteArrayToBuffer } from './utils';

export function deblind (transformedPassword, blindingSecret) {
	if (transformedPassword == null) throw new Error('transformedPassword is required');
	if (blindingSecret == null) throw new Error('blindingSecret is required');

	transformedPassword = bufferToVirgilByteArray(transformedPassword);
	blindingSecret = bufferToVirgilByteArray(blindingSecret);

	const pythia = new lib.VirgilPythia();
	const deblindedPassword = pythia.deblind(transformedPassword, blindingSecret);

	return virgilByteArrayToBuffer(deblindedPassword);
}