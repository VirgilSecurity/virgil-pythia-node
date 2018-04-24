import 'mocha';
import assert from 'assert';
import { blind } from '../crypto/blind';
import { deblind } from '../crypto/deblind';
import { transform } from '../crypto/transform';
import { computeTransformationKeyPair } from '../crypto/computeTransformationKeyPair';
import { prove } from '../crypto/prove';
import { verify } from '../crypto/verify';
import { getPasswordUpdateToken } from '../crypto/getPasswordUpdateToken';
import { updateDeblindedWithToken } from '../crypto/updateDeblindedWithToken';


const DEBLINDED_PASSWORD_HEX = '13273238e3119262f86d3213b8eb6b99c093ef48737d' +
	'fcfae96210f7350e096cbc7e6b992e4e6f705ac3f0a915d1622c1644596408e3d16126d' +
	'dfa9ce594e9f361b21ef9c82309e5714c09bcd7f7ec5c2666591134c645d45ed8c9703e' +
	'718ee005fe4b97fc40f69b424728831d0a889cd39be04683dd380daa0df67c38279e3b9' +
	'fe32f6c40780311f2dfbb6e89fc90ef15fb2c7958e387182dc7ef57f716fdd152a58ac1' +
	'd3f0d19bfa2f789024333976c69fbe9e24b58d6cd8fa49c5f4d642b00f8e390c199f37f' +
	'7b3125758ef284ae10fd9c2da7ea280550baccd55dadd70873a063bcfc9cac9079042af' +
	'88a543a6cc09aaed6ba4954d6ee8ccc6e1145944328266616cd00f8a616f0e79e52ddd2' +
	'ef970c8ba8f8ffce35505dc643c8e2b6e430a1474a6d043a4daf9b62af87c1d45ca994d' +
	'23f908f7898a3f44ca7bb642122087ca819308b3d8afad17ca1f6148e8750870336ca68' +
	'eb783c89b0dc9d92392f453c650e9f09232b9fcffd1c2cad24b14d2b4952b7f54552295' +
	'ce0e854996913c';

const DEBLINDED_PASSWORD = new Buffer(DEBLINDED_PASSWORD_HEX, 'hex');

const PASSWORD = 'password';
const TRANSFORMATION_KEY_ID = new Buffer('virgil.com');
const TWEAK = new Buffer('alice');
const PYTHIA_SECRET = new Buffer('master secret');
const NEW_PYTHIA_SECRET = new Buffer('secret master');
const PYTHIA_SCOPE_SECRET = new Buffer('server secret');

function blindEvalDeblind() {
	const { blindingSecret, blindedPassword } = blind(PASSWORD);
	const transformationKeyPair = computeTransformationKeyPair(
		TRANSFORMATION_KEY_ID,
		PYTHIA_SECRET,
		PYTHIA_SCOPE_SECRET
	);
	const { transformedPassword } = transform(blindedPassword, TWEAK, transformationKeyPair.privateKey);
	return deblind(transformedPassword, blindingSecret);
}

describe('Deblind Stability', () => {
	it ('produces the same result for multiple iterations', () => {
		const iterationsCount = 10;

		for (let i = 0; i < iterationsCount; i++) {
			let deblindedPassword = blindEvalDeblind();
			assert.ok(deblindedPassword.equals(DEBLINDED_PASSWORD), 'deblined password is equal to pre-computed');
		}
	});
});

describe('BlindEvalProveVerify', () => {
	it ('verifies transformed password', () => {
		const { blindedPassword } = blind(PASSWORD);
		const transformationKeyPair = computeTransformationKeyPair(
			TRANSFORMATION_KEY_ID,
			PYTHIA_SECRET,
			PYTHIA_SCOPE_SECRET
		);
		const { transformedPassword, transformedTweak } = transform(
			blindedPassword,
			TWEAK,
			transformationKeyPair.privateKey
		);
		const { proofValueC, proofValueU } = prove(
			transformedPassword,
			blindedPassword,
			transformedTweak,
			transformationKeyPair
		);
		const verified = verify(
			transformedPassword,
			blindedPassword,
			TWEAK,
			transformationKeyPair.publicKey,
			proofValueC,
			proofValueU
		);

		assert.equal(verified, true, 'password is verified');
	});
});

describe('Update Delta', () => {
	it ('updates deblinded password with token', () => {
		const { blindingSecret, blindedPassword } = blind(PASSWORD);
		const oldTransformationKeyPair = computeTransformationKeyPair(
			TRANSFORMATION_KEY_ID,
			PYTHIA_SECRET,
			PYTHIA_SCOPE_SECRET
		);
		const { transformedPassword } = transform(
			blindedPassword,
			TWEAK,
			oldTransformationKeyPair.privateKey
		);
		const deblindedPassword = deblind(transformedPassword, blindingSecret);
		const newTransformationKeyPair = computeTransformationKeyPair(
			TRANSFORMATION_KEY_ID,
			NEW_PYTHIA_SECRET,
			PYTHIA_SCOPE_SECRET
		);

		const updateToken = getPasswordUpdateToken(
			oldTransformationKeyPair.privateKey,
			newTransformationKeyPair.privateKey
		);

		const updatedDeblindedPassword = updateDeblindedWithToken(deblindedPassword, updateToken);
		const { blindingSecret: newBlindingSecret, blindedPassword: newBlindedPassword } = blind(PASSWORD);
		const { transformedPassword: newTransformedPassword } = transform(
			newBlindedPassword,
			TWEAK,
			newTransformationKeyPair.privateKey
		);

		const newDeblindedPassword = deblind(newTransformedPassword, newBlindingSecret);
		assert.ok(updatedDeblindedPassword.equals(newDeblindedPassword), 'updated password is equal to computed');
	});
});

describe('Blind Huge Password', () => {
	it ('works with huge passwords', () => {
		const hugePassword = PASSWORD.repeat(16);
		const blindResult = blind(hugePassword);
		assert.ok(blindResult);
	});
});
