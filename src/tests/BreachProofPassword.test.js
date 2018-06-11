import { getRandomBytes } from './utils/getRandomBytes';
import { BreachProofPassword } from '../pythia/BreachProofPassword';

describe('BreachProofPassword', () => {
	it ('can be serialized with JSON.stringify', () => {
		const salt = getRandomBytes(16);
		const deblindedPassword = getRandomBytes(16);
		const version = 1;

		const bpPassword = new BreachProofPassword(salt, deblindedPassword, version);
		const serialized = JSON.stringify(bpPassword);
		assert.isOk(serialized, 'serialized to string');
		const parsed = JSON.parse(serialized);
		assert.equal(parsed.salt, salt.toString('base64'));
		assert.equal(parsed.deblindedPassword, deblindedPassword.toString('base64'));
		assert.equal(parsed.version, version);
	});
});
