import lib from '../../virgil_crypto_nodejs';
import { bufferToVirgilByteArray, virgilByteArrayToBuffer } from './utils';

export function transform (blindedPassword, tweak, transformationPrivateKey) {
	if (blindedPassword == null) throw new Error('blindedPassword is required');
	if (tweak == null) throw new Error('tweak is required');
	if (transformationPrivateKey == null) throw new Error('transformationPrivateKey is required');

	blindedPassword = bufferToVirgilByteArray(blindedPassword);
	tweak = bufferToVirgilByteArray(tweak);
	transformationPrivateKey = bufferToVirgilByteArray(transformationPrivateKey);

	const pythia = new lib.VirgilPythia();
	const result = pythia.transform(
		blindedPassword,
		tweak,
		transformationPrivateKey
	);

	return {
		transformedPassword: virgilByteArrayToBuffer(result.transformedPassword()),
		transformedTweak: virgilByteArrayToBuffer(result.transformedTweak()),
	};
}
