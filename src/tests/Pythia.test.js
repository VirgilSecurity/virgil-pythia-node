import 'mocha';
import { assert } from 'chai';
import { sleep } from './utils/sleep';
import { createPythia } from '../pythia/createPythia';

const proofKeyList = process.env.MY_PROOF_KEYS.split(';');
const updateToken = process.env.MY_UPDATE_TOKEN;
const thePassword = 'my password';

describe('Pythia', function () {
	this.timeout(10000);

	let pythia;
	beforeEach(() => {
		pythia = createPythia({
			apiKeyBase64: process.env.VIRGIL_API_KEY,
			apiKeyId: process.env.VIRGIL_API_KEY_ID,
			appId: process.env.VIRGIL_APP_ID,
			proofKeys: proofKeyList[0], // use only the first key
			apiUrl: process.env.VIRGIL_API_URL
		});
	});

	describe('Registration', () => {
		it ('creates new breach-proof password', () => {
			return pythia.createBreachProofPassword(thePassword)
				.then(bpPassword => {
					assert.isOk(bpPassword.salt, 'has salt');
					assert.isOk(bpPassword.deblindedPassword, 'has deblindedPassword');
					assert.equal(bpPassword.version, 1, 'has version');
				});
		});
	});

	describe('Authentication', () => {
		let breachProofPassword;
		before(() => {
			return pythia.createBreachProofPassword(thePassword)
				.then(bpPassword => {
					breachProofPassword = bpPassword;
				});
		});

		// this is needed due to rate limiting on the server side
		beforeEach(() => sleep(2000));

		it ('verifies password without proof', () => {
			return pythia.verifyBreachProofPassword(thePassword, breachProofPassword, false)
				.then(verified => {
					assert.isTrue(verified);
				});
		});

		it ('verifies password with proof', () => {
			return pythia.verifyBreachProofPassword(thePassword, breachProofPassword, true)
				.then(verified => {
					assert.isTrue(verified);
				})
		});

		it ('verifies wrong password', () => {
			return pythia.verifyBreachProofPassword('wrong password', breachProofPassword, false)
				.then(verified => {
					assert.isFalse(verified)
				});
		});

		it ('verifies wrong password with proof', () => {
			return pythia.verifyBreachProofPassword('wrong password', breachProofPassword, true)
				.then(verified => {
					assert.isFalse(verified)
				});
		});
	});

	describe('Update', () => {
		let breachProofPassword;
		before(() => {
			// create the password with version 1 key
			return pythia.createBreachProofPassword(thePassword)
				.then(bpPassword => {
					breachProofPassword = bpPassword;
				});
		});

		it ('updates breach-proof password with update token', () => {
			const updatedPythia = createPythia({
				apiKeyBase64: process.env.VIRGIL_API_KEY,
				apiKeyId: process.env.VIRGIL_API_KEY_ID,
				appId: process.env.VIRGIL_APP_ID,
				proofKeys: proofKeyList, // use two keys
				apiUrl: process.env.VIRGIL_API_URL
			});

			const newBpPassword = updatedPythia.updateBreachProofPassword(updateToken, breachProofPassword);
			assert.isTrue(newBpPassword.salt.equals(breachProofPassword.salt), 'salt is the same');
			assert.isFalse(
				newBpPassword.deblindedPassword.equals(breachProofPassword.deblindedPassword),
				'deblinded password is different'
			);
			assert.equal(newBpPassword.version, 2, 'version is greater');
		});
	});

	describe('Authentication with updated password', () => {
		let updatedPythia, updatedBreachProofPassword;

		before(() => {
			updatedPythia = createPythia({
				apiKeyBase64: process.env.VIRGIL_API_KEY,
				apiKeyId: process.env.VIRGIL_API_KEY_ID,
				appId: process.env.VIRGIL_APP_ID,
				proofKeys: proofKeyList, // use two keys
				apiUrl: process.env.VIRGIL_API_URL
			});

			// create the password with version 1 key
			return pythia.createBreachProofPassword(thePassword)
				.then(bpPassword => {
					updatedBreachProofPassword = updatedPythia.updateBreachProofPassword(updateToken, bpPassword);
				});
		});

		beforeEach(() => {
			// this is needed due to rate limiting on the server side
			return sleep(2000);
		});

		it ('verifies updated password without proof', () => {
			return updatedPythia.verifyBreachProofPassword(thePassword, updatedBreachProofPassword, false)
				.then(verified => {
					assert.isTrue(verified);
				});
		});

		it ('verifies updated password with proof', () => {
			return updatedPythia.verifyBreachProofPassword(thePassword, updatedBreachProofPassword, true)
				.then(verified => {
					assert.isTrue(verified);
				});
		});
	});
});
