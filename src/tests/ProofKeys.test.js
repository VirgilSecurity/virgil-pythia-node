import { getRandomBytes } from './utils/getRandomBytes';
import { ProofKeys } from '../pythia/ProofKeys';
import data from './data/pythia-sdk';

function getProofKeyString(version, publicKey) {
	return `PK.${version}.${publicKey.toString('base64')}`;
}

describe('ProofKeys', () => {
	it ('parses proof key string', () => {
		const proofKeyPublicKey = getRandomBytes(16);
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
		const proofKey99PublicKey = getRandomBytes(16);
		const proofKey99Version = 99;
		const proofKey100PublicKey = getRandomBytes(16);
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

	it ('identifies proof key with the greatest version as current', () => {
		const proofKey99PublicKey = getRandomBytes(16);
		const proofKey99Version = 99;
		const proofKey100PublicKey = getRandomBytes(16);
		const proofKey100Version = 100;

		const proofKeys = new ProofKeys([
			getProofKeyString(proofKey100Version, proofKey100PublicKey),
			getProofKeyString(proofKey99Version, proofKey99PublicKey)
		]);

		const currentKey = proofKeys.currentKey();
		assert.equal(currentKey.version, 100);
	});

	it ('throws when queried for key that does not exist', () => {
		const proofKeys = new ProofKeys(getProofKeyString(1, getRandomBytes(16)));
		assert.throws(() => {
			proofKeys.proofKey(99);
		}, /does not exist/);
	});

	it ('throws when initialized with empty list', () => {
		assert.throws(() => {
			new ProofKeys([]);
		}, /empty/)
	});

	it ('throws when initialized with invalid key', () => {
		assert.throws(() => {
			new ProofKeys(data.kInvalidProofKey);
		}, /invalid/);
	});
});
