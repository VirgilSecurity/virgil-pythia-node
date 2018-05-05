import 'mocha';
import { assert } from 'chai';
import { randomBytes } from 'crypto';
import { BreachProofPassword } from '../pythia/BreachProofPassword';

describe('BreachProofPassword', () => {
	it ('can be serialized with JSON.stringify', () => {
		const salt = randomBytes(16);
		const deblindedPassword = randomBytes(16);
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
