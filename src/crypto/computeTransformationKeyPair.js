import lib from '../../virgil_crypto_nodejs';
import { bufferToVirgilByteArray, virgilByteArrayToBuffer } from './utils';

export function computeTransformationKeyPair(transformationKeyId, pythiaSecret, pythiaScopeSecret) {
	if (transformationKeyId == null) throw new Error('transformationKeyId is required');
	if (pythiaSecret == null) throw new Error('pythiaSecret is required');
	if (pythiaScopeSecret == null) throw new Error('pythiaScopeSecret is required');

	transformationKeyId = bufferToVirgilByteArray(transformationKeyId);
	pythiaSecret = bufferToVirgilByteArray(pythiaSecret);
	pythiaScopeSecret = bufferToVirgilByteArray(pythiaScopeSecret);

	const pythia = new lib.VirgilPythia();
	const keyPair = pythia.computeTransformationKeyPair(
		transformationKeyId,
		pythiaSecret,
		pythiaScopeSecret
	);

	return {
		privateKey: virgilByteArrayToBuffer(keyPair.privateKey()),
		publicKey: virgilByteArrayToBuffer(keyPair.publicKey())
	};
}
