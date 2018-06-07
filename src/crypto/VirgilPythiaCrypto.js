import { VirgilPythia } from 'virgil-crypto/dist/virgil-crypto-pythia.cjs';

const SALT_BYTE_LENGTH = 32;

export class VirgilPythiaCrypto {
	constructor (virgilCrypto) {
		if (virgilCrypto == null) throw new Error('`virgilCrypto` is required');

		this.virgilCrypto = virgilCrypto;
		this.virgilPythia = new VirgilPythia();
	}

	blind (password) {
		return this.virgilPythia.blind(password);
	}

	deblind ({ transformedPassword, blindingSecret }) {
		return this.virgilPythia.deblind({ transformedPassword, blindingSecret });
	}

	verify ({
		transformedPassword,
		blindedPassword,
		tweak,
		transformationPublicKey,
		proofValueC,
		proofValueU
	}) {
		return this.virgilPythia.verify({
			transformedPassword,
			blindedPassword,
			tweak,
			transformationPublicKey,
			proofValueC,
			proofValueU
		});
	}

	updateDeblinded ({ deblindedPassword, updateToken }) {
		return this.virgilPythia.updateDeblindedWithToken({
			deblindedPassword,
			updateToken
		});
	}

	generateSalt () {
		return this.virgilCrypto.getRandomBytes(SALT_BYTE_LENGTH);
	}

	generateKeyPair ({ type, seed }) {
		if (seed == null) throw new Error('`seed` is required');

		return this.virgilCrypto.generateKeysFromKeyMaterial(seed, type);
	}
}
