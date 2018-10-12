import sinon from 'sinon';
import {
	VirgilCrypto,
	VirgilPythiaCrypto,
	VirgilAccessTokenSigner
} from 'virgil-crypto/dist/virgil-crypto-pythia.cjs';
import { JwtGenerator, GeneratorJwtProvider } from 'virgil-sdk';
import { sleep } from './utils/sleep';
import { createPythia } from '../pythia/createPythia';
import testData from './data/pythia-sdk';

const proofKeyList = process.env.MY_PROOF_KEYS.split(';');
const updateToken = process.env.MY_UPDATE_TOKEN;
const thePassword = 'my password';

const SALT_SIZE = 32;
const MIN_DEBLINDED_PASSWORD_SIZE = 300;

describe ('Pythia', function () {
	this.timeout(10000);

	let pythia;
	beforeEach(() => {
		const virgilCrypto = new VirgilCrypto();
		const virgilPythiaCrypto = new VirgilPythiaCrypto();
		const jwtGenerator = new JwtGenerator({
			apiKey: virgilCrypto.importPrivateKey(process.env.VIRGIL_API_KEY),
			apiKeyId: process.env.VIRGIL_API_KEY_ID,
			appId: process.env.VIRGIL_APP_ID,
			accessTokenSigner: new VirgilAccessTokenSigner(virgilCrypto),
			millisecondsToLive: 60 * 60 * 1000
		});

		pythia = createPythia({
			virgilCrypto,
			virgilPythiaCrypto,
			accessTokenProvider: new GeneratorJwtProvider(jwtGenerator),
			proofKeys: proofKeyList[0], // use only the first key
			apiUrl: process.env.VIRGIL_API_URL
		});
	});

	describe('Registration', () => {
		it ('creates new breach-proof password', () => {
			return pythia.createBreachProofPassword(thePassword)
				.then(bpp => {
					assert.equal(bpp.salt.byteLength, SALT_SIZE, 'has salt');
					assert.isAtLeast(
						bpp.deblindedPassword.byteLength,
						MIN_DEBLINDED_PASSWORD_SIZE,
						'has deblinded password'
					);
					assert.equal(bpp.version, 1, 'has correct version');
				});
		});

		it ('creates different passwords from the same input (YTC-13)', () => {
			return Promise.all([
				pythia.createBreachProofPassword(thePassword),
				pythia.createBreachProofPassword(thePassword)
			]).then(([ bpp1, bpp2 ]) => {
				assert.notDeepEqual(bpp1.salt, bpp2.salt, 'salt is different');
				assert.notDeepEqual(
					bpp1.deblindedPassword,
					bpp2.deblindedPassword,
					'deblided password is different'
				);
				assert.equal(bpp1.version, bpp2.version, 'version is the same');
			});
		});
	});

	describe('Authentication', () => {
		let bpp;
		before(() => {
			return pythia.createBreachProofPassword(thePassword)
				.then(newBpp => {
					bpp = newBpp;
				});
		});

		// this is needed due to rate limiting on the server side
		beforeEach(() => sleep(2000));

		it ('verifies password without proof (YTC-15)', () => {
			return pythia.verifyBreachProofPassword(thePassword, bpp, false)
				.then(isVerified => assert.isTrue(isVerified));
		});

		it ('verifies password with proof (YTC-15)', () => {
			return pythia.verifyBreachProofPassword(thePassword, bpp, true)
				.then(isVerified => assert.isTrue(isVerified));
		});

		it ('verifies wrong password (YTC-15)', () => {
			return pythia.verifyBreachProofPassword('wrong password', bpp, false)
				.then(isVerified => assert.isFalse(isVerified));
		});

		it ('verifies wrong password with proof (YTC-15)', () => {
			return pythia.verifyBreachProofPassword('wrong password', bpp, true)
				.then(isVerified => assert.isFalse(isVerified));
		});
	});

	describe('Verification (YTC-16)', () => {
		let stubbedPythia, bpp;

		before(() => {
			const virgilCrypto = new VirgilCrypto();
			const virgilPythiaCrypto = new VirgilPythiaCrypto();

			// proof verification always fails
			sinon.stub(
				virgilPythiaCrypto,
				'verify'
			).callsFake(() => false);

			const jwtGenerator = new JwtGenerator({
				apiKey: virgilCrypto.importPrivateKey(process.env.VIRGIL_API_KEY),
				apiKeyId: process.env.VIRGIL_API_KEY_ID,
				appId: process.env.VIRGIL_APP_ID,
				accessTokenSigner: new VirgilAccessTokenSigner(virgilCrypto),
				millisecondsToLive: 60 * 60 * 1000
			});

			stubbedPythia = createPythia({
				virgilCrypto,
				virgilPythiaCrypto,
				accessTokenProvider: new GeneratorJwtProvider(jwtGenerator),
				proofKeys: proofKeyList, // use two keys
				apiUrl: process.env.VIRGIL_API_URL
			});

			// create bpp with normal `pythia` because proof verification
			// during `createBreachProofPassword` is mandatory.
			return pythia.createBreachProofPassword(thePassword)
				.then(newBpp => bpp = newBpp);
		});

		// this is needed due to rate limiting on the server side
		beforeEach(() => sleep(2000));

		it ('verifies correct password without proof', () => {
			return stubbedPythia.verifyBreachProofPassword(thePassword, bpp, false)
				.then(isVerified => assert.isTrue(isVerified));
		});

		it ('rejects with an error when proof check fails', done => {
			stubbedPythia.verifyBreachProofPassword(thePassword, bpp, true)
				.then(() => done(new Error('verification should have failed')))
				.catch(err => {
					if (err.name === 'ProofVerificationFailedError') return done();
					done(err);
				});
		});

		it ('verifies incorrect password witout proof', () => {
			return stubbedPythia.verifyBreachProofPassword('not the password', bpp, false)
				.then(isVerified => assert.isFalse(isVerified));
		});

		it ('rejects with an error when proof check fails', done => {
			stubbedPythia.verifyBreachProofPassword('not the password', bpp, true)
				.then(() => done(new Error('verification should have failed')))
				.catch(err => {
					if (err.name === 'ProofVerificationFailedError') return done();
					done(err);
				});
		});
	});

	describe('Update', () => {
		let updatedPythia, bpp;

		before(() => {
			const virgilCrypto = new VirgilCrypto();
			const virgilPythiaCrypto = new VirgilPythiaCrypto();
			const jwtGenerator = new JwtGenerator({
				apiKey: virgilCrypto.importPrivateKey(process.env.VIRGIL_API_KEY),
				apiKeyId: process.env.VIRGIL_API_KEY_ID,
				appId: process.env.VIRGIL_APP_ID,
				accessTokenSigner: new VirgilAccessTokenSigner(virgilCrypto),
				millisecondsToLive: 60 * 60 * 1000
			});

			updatedPythia = createPythia({
				virgilCrypto,
				virgilPythiaCrypto,
				accessTokenProvider: new GeneratorJwtProvider(jwtGenerator),
				proofKeys: proofKeyList, // use two keys
				apiUrl: process.env.VIRGIL_API_URL
			});

			// create the password with version 1 key
			return pythia.createBreachProofPassword(thePassword)
				.then(bpPassword => {
					bpp = bpPassword;
				});
		});

		it ('updates breach-proof password with update token', () => {
			const updatedBpp = updatedPythia.updateBreachProofPassword(updateToken, bpp);
			assert.deepEqual(updatedBpp.salt, bpp.salt, 'salt is the same');
			assert.notDeepEqual(
				updatedBpp.deblindedPassword,
				bpp.deblindedPassword,
				'deblinded password is different'
			);
			assert.equal(updatedBpp.version, 2, 'version is greater');
		});

		it ('throws error when bpp is already migrated (YTC-18)', () => {
			// use `updatedPythia` instance with two proof keys (current is proof key #2)
			return updatedPythia.createBreachProofPassword(thePassword)
				.then(bpp => {
					assert.throws(
						() => updatedPythia.updateBreachProofPassword(updateToken, bpp),
						'Unexpected Breach-proof password version. Expected 1, got 2'
					);
				});
		});

		it ('throws error when bpp is has wrong version (YTC-19)', () => {
			// use `pythia` instance with the single proof key (proof key #1)
			return pythia.createBreachProofPassword(thePassword)
				.then(bpp => {
					assert.throws(
						() => pythia.updateBreachProofPassword(testData.kUpdateToken, bpp),
						'Unexpected Breach-proof password version. Expected 2, got 1'
					);
				});
		});

		it ('throws error when given invalid update token (YTC-20)', () => {
			assert.throws(
				() => updatedPythia.updateBreachProofPassword(
					testData.kInvalidUpdateToken,
					bpp
				),
				'UpdateToken string is invalid'
			);
		});
	});

	describe('Authentication with updated password', () => {
		let updatedPythia, updatedBpp, originalBpp;

		before(() => {
			const virgilCrypto = new VirgilCrypto();
			const virgilPythiaCrypto = new VirgilPythiaCrypto();
			const jwtGenerator = new JwtGenerator({
				apiKey: virgilCrypto.importPrivateKey(process.env.VIRGIL_API_KEY),
				apiKeyId: process.env.VIRGIL_API_KEY_ID,
				appId: process.env.VIRGIL_APP_ID,
				accessTokenSigner: new VirgilAccessTokenSigner(virgilCrypto),
				millisecondsToLive: 60 * 60 * 1000
			});

			updatedPythia = createPythia({
				virgilCrypto,
				virgilPythiaCrypto,
				accessTokenProvider: new GeneratorJwtProvider(jwtGenerator),
				proofKeys: proofKeyList, // use two keys
				apiUrl: process.env.VIRGIL_API_URL
			});

			// create the password with version 1 key
			return pythia.createBreachProofPassword(thePassword)
				.then(bpp => {
					originalBpp = bpp;
					// update the password with version 2 key
					updatedBpp = updatedPythia.updateBreachProofPassword(updateToken, bpp);
				});
		});

		beforeEach(() => {
			// this is needed due to rate limiting on the server side
			return sleep(2000);
		});

		it ('verifies updated password without proof', () => {
			return updatedPythia.verifyBreachProofPassword(thePassword, updatedBpp, false)
				.then(isVerified => assert.isTrue(isVerified));
		});

		it ('verifies updated password with proof', () => {
			return updatedPythia.verifyBreachProofPassword(thePassword, updatedBpp, true)
				.then(isVerified => assert.isTrue(isVerified));
		});

		it ('verifies original password (YTC-17)', () => {
			return updatedPythia.verifyBreachProofPassword(thePassword, originalBpp, false)
				.then(isVerified => assert.isTrue(isVerified));
		});

		it ('creates new passwords with new version (YTC-14)', () => {
			return updatedPythia.createBreachProofPassword(thePassword)
				.then(newBpp => assert.equal(newBpp.version, 2, 'version is correct'));
		});
	});
});
