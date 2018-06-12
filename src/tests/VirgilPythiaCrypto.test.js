import { createVirgilCrypto, VirgilPythia } from 'virgil-crypto/dist/virgil-crypto-pythia.cjs'
import { VirgilPythiaCrypto } from '../crypto/VirgilPythiaCrypto';

describe('VirgilPythiaCrypto', () => {
	describe('Generate Salt', () => {
		it ('generates 32 bytes by default', () => {
			const pythiaCrypto = new VirgilPythiaCrypto(createVirgilCrypto(), new VirgilPythia());
			const salt = pythiaCrypto.generateSalt();
			assert.equal(salt.length, 32);
		});
	})
});
