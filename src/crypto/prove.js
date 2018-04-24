import lib from '../../virgil_crypto_nodejs';
import { bufferToVirgilByteArray, virgilByteArrayToBuffer } from './utils';

export function prove(transformedPassword, blindedPassword, transformedTweak, transformationKeyPair) {
	if (transformedPassword == null) throw new Error('transformedPassword is required');
	if (blindedPassword == null) throw new Error('blindedPassword is required');
	if (transformedTweak == null) throw new Error('transformedTweak is required');
	if (transformationKeyPair == null) throw new Error('transformationKeyPair is required');

	transformedPassword = bufferToVirgilByteArray(transformedPassword);
	blindedPassword = bufferToVirgilByteArray(blindedPassword);
	transformedTweak = bufferToVirgilByteArray(transformedTweak);
	transformationKeyPair = new lib.VirgilPythiaTransformationKeyPair(
		bufferToVirgilByteArray(transformationKeyPair.privateKey),
		bufferToVirgilByteArray(transformationKeyPair.publicKey)
	);

	const pythia = new lib.VirgilPythia();
	const result = pythia.prove(
		transformedPassword,
		blindedPassword,
		transformedTweak,
		transformationKeyPair
	);

	return {
		proofValueC: virgilByteArrayToBuffer(result.proofValueC()),
		proofValueU: virgilByteArrayToBuffer(result.proofValueU()),
	}
}
