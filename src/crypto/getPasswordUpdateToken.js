import lib from '../../virgil_crypto_nodejs';
import { bufferToVirgilByteArray, virgilByteArrayToBuffer } from './utils';

export function getPasswordUpdateToken(oldTransformationPrivateKey, newTransformationPrivateKey) {
	if (oldTransformationPrivateKey == null) throw new Error('oldTransformationPrivateKey is required');
	if (newTransformationPrivateKey == null) throw new Error('newTransformationPrivateKey is required');

	oldTransformationPrivateKey = bufferToVirgilByteArray(oldTransformationPrivateKey);
	newTransformationPrivateKey = bufferToVirgilByteArray(newTransformationPrivateKey);

	const pythia = new lib.VirgilPythia();
	const updateToken = pythia.getPasswordUpdateToken(
		oldTransformationPrivateKey,
		newTransformationPrivateKey
	);

	return virgilByteArrayToBuffer(updateToken);
}
