import lib from '../../virgil_crypto_nodejs';
import { bufferToVirgilByteArray } from './utils';

export function verify (
	transformedPassword, blindedPassword, tweak, transformationPublicKey, proofValueC, proofValueU
) {
	if (transformedPassword == null) throw new Error('transformedPassword is required');
	if (blindedPassword == null) throw new Error('blindedPassword is required');
	if (tweak == null) throw new Error('tweak is required');
	if (transformationPublicKey == null) throw new Error('transformationPublicKey is required');
	if (proofValueC == null) throw new Error('proofValueC is required');
	if (proofValueU == null) throw new Error('proofValueU is required');

	transformedPassword = bufferToVirgilByteArray(transformedPassword);
	blindedPassword = bufferToVirgilByteArray(blindedPassword);
	tweak = bufferToVirgilByteArray(tweak);
	transformationPublicKey = bufferToVirgilByteArray(transformationPublicKey);
	proofValueC = bufferToVirgilByteArray(proofValueC);
	proofValueU = bufferToVirgilByteArray(proofValueU);

	const pythia = new lib.VirgilPythia();
	const verified = pythia.verify(
		transformedPassword,
		blindedPassword,
		tweak,
		transformationPublicKey,
		proofValueC,
		proofValueU
	);

	return verified;
}
