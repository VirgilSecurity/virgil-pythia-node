import 'mocha';
import { assert } from 'chai';
import { randomBytes } from 'crypto';
import { ProofKeys } from '../pythia/ProofKeys';

function getProofKeyString(version, publicKey) {
	return `PK.${version}.${publicKey.toString('base64')}`;
}

describe('ProofKeys', () => {
	it ('parses proof key string', () => {
		const proofKeyPublicKey = randomBytes(16);
		const proofKeyVersion = 99;
		const proofKeys = new ProofKeys(
			getProofKeyString(proofKeyVersion, proofKeyPublicKey)
		);

		const actualProofKey = proofKeys.currentKey();
		assert.isOk(actualProofKey, 'current key exists');
		assert.equal(actualProofKey.version, proofKeyVersion);
		assert.isTrue(actualProofKey.key.equals(proofKeyPublicKey));
	});

	it ('parses proof keys array', () => {
		const proofKey99PublicKey = randomBytes(16);
		const proofKey99Version = 99;
		const proofKey100PublicKey = randomBytes(16);
		const proofKey100Version = 100;

		const proofKeys = new ProofKeys([
			getProofKeyString(proofKey99Version, proofKey99PublicKey),
			getProofKeyString(proofKey100Version, proofKey100PublicKey)
		]);

		const actualProofKey99 = proofKeys.proofKey(proofKey99Version);
		assert.isOk(actualProofKey99, 'proofKey of version 99 exists');
		assert.isTrue(actualProofKey99.key.equals(proofKey99PublicKey));

		const actualProofKey100 = proofKeys.proofKey(proofKey100Version);
		assert.isOk(actualProofKey100, 'proofKey of version 100 exists');
		assert.isTrue(actualProofKey100.key.equals(proofKey100PublicKey));
	});

	it ('identifies proof key with the lowest version as current', () => {
		const proofKey99PublicKey = randomBytes(16);
		const proofKey99Version = 99;
		const proofKey100PublicKey = randomBytes(16);
		const proofKey100Version = 100;

		const proofKeys = new ProofKeys([
			getProofKeyString(proofKey100Version, proofKey100PublicKey),
			getProofKeyString(proofKey99Version, proofKey99PublicKey)
		]);

		const currentKey = proofKeys.currentKey();
		assert.equal(currentKey.version, 99);
	});

	it ('throws when queried for key that does not exist', () => {
		const proofKeys = new ProofKeys(getProofKeyString(1, randomBytes(16)));
		assert.throws(() => {
			proofKeys.proofKey(99);
		}, /does not exist/);
	});
});
