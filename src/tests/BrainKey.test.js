import sinon from 'sinon';
import { JwtGenerator, GeneratorJwtProvider } from 'virgil-sdk';
import { createVirgilCrypto, VirgilPythia, VirgilAccessTokenSigner } from 'virgil-crypto/dist/virgil-crypto-pythia.cjs';
import { sleep } from './utils/sleep';
import { createBrainKey } from '../brainkey/createBrainKey';
import { BrainKey } from '../brainkey/BrainKey';
import { VirgilPythiaCrypto } from '../crypto/VirgilPythiaCrypto';
import data from './data/brainkey';

describe ('BrainKey', function () {
	this.timeout(10000);

	describe ('SDK Compatibility (YTC-21)', () => {
		let brainKeyWithStubClient;

		before (() => {
			const virgilCrypto = createVirgilCrypto();
			const virgilPythia = new VirgilPythia();

			const clientStub = {
				generateSeed: sinon.stub().callsFake(({ blindedPassword, brainKeyId }) => {
					const transformationKeyId = Buffer.from(data.kTransformationKeyId);
					const pythiaSecret = Buffer.from(data.kSecret);
					const pythiaScopeSecret = Buffer.from(data.kScopeSecret);
					const tweak = Buffer.from('userId' + (brainKeyId == null ? '' : brainKeyId));

					const transformationKeyPair = virgilPythia.computeTransformationKeyPair({
						transformationKeyId, pythiaSecret, pythiaScopeSecret
					});
					const { transformedPassword } = virgilPythia.transform({
						blindedPassword,
						tweak,
						transformationPrivateKey: transformationKeyPair.privateKey
					});

					return Promise.resolve(transformedPassword);
				})
			};

			const generator = new JwtGenerator({
				apiKey: virgilCrypto.importPrivateKey(process.env.VIRGIL_API_KEY),
				apiKeyId: process.env.VIRGIL_API_KEY_ID,
				appId: process.env.VIRGIL_APP_ID,
				accessTokenSigner: new VirgilAccessTokenSigner(virgilCrypto),
				millisecondsToLive: 1000 * 60 * 60
			});

			brainKeyWithStubClient = new BrainKey({
				accessTokenProvider: new GeneratorJwtProvider(generator, undefined, 'pythia_user_' + Date.now()),
				client: clientStub,
				pythiaCrypto: new VirgilPythiaCrypto(virgilCrypto, new VirgilPythia())
			});
		});

		it ('generates the same key pair for the same password (password1)', () => {
			const expectedKeyIdentifier = Buffer.from(data.kKeyId1, 'base64');
			return Promise.all([
				brainKeyWithStubClient.generateKeyPair(data.kPassword1),
				brainKeyWithStubClient.generateKeyPair(data.kPassword1)
			]).then(([ keyPair1, keyPair2 ]) => {
				assert.isTrue(keyPair1.privateKey.identifier.equals(expectedKeyIdentifier));
				assert.isTrue(keyPair2.privateKey.identifier.equals(expectedKeyIdentifier));
			});
		});

		it ('generates different key pair for different password (password2)', () => {
			const expectedKeyIdentifier = Buffer.from(data.kKeyId2, 'base64');
			return brainKeyWithStubClient.generateKeyPair(data.kPassword2)
				.then(keyPair => {
					assert.isTrue(keyPair.privateKey.identifier.equals(expectedKeyIdentifier));
				});
		});

		it ('generates different key pair based on brainKeyId', () => {
			const expectedKeyIdentifier = Buffer.from(data.kKeyId3, 'base64');
			return brainKeyWithStubClient.generateKeyPair(data.kPassword1, data.kBrainKeyId)
				.then(keyPair => {
					assert.isTrue(keyPair.privateKey.identifier.equals(expectedKeyIdentifier));
				});
		});
	});

	describe ('Integration', () => {

		let brainKey, keyPair1Identifier;
		before(() => {
			const virgilCrypto = createVirgilCrypto();
			const virgilPythia = new VirgilPythia();
			const generator = new JwtGenerator({
				apiKey: virgilCrypto.importPrivateKey(process.env.VIRGIL_API_KEY),
				apiKeyId: process.env.VIRGIL_API_KEY_ID,
				appId: process.env.VIRGIL_APP_ID,
				accessTokenSigner: new VirgilAccessTokenSigner(virgilCrypto),
				millisecondsToLive: 1000 * 60 * 60
			});
			const accessTokenProvider = new GeneratorJwtProvider(generator, undefined, 'pythia_user_' + Date.now());

			brainKey = createBrainKey({
				virgilCrypto,
				virgilPythia,
				accessTokenProvider,
				apiUrl: process.env.VIRGIL_API_URL
			});

			return brainKey.generateKeyPair(data.kPassword1)
				.then(keyPair => {
					keyPair1Identifier = keyPair.privateKey.identifier;
				});
		});

		// this is needed due to rate limiting on the server side
		beforeEach(() => sleep(2000));

		it ('generates the same key pair for the same password (password1)', () => {
			return brainKey.generateKeyPair(data.kPassword1)
				.then(keyPair2 => {
					assert.isTrue(keyPair2.privateKey.identifier.equals(keyPair1Identifier));
				});
		});

		it ('generates different key pair for different password (password2)', () => {
			return brainKey.generateKeyPair(data.kPassword2)
				.then(keyPair3 => {
					assert.isFalse(keyPair3.privateKey.identifier.equals(keyPair1Identifier))
				});
		});

		it ('generates different key pair for the same password but different ID', () => {
			return brainKey.generateKeyPair(data.kPassword1, data.kBrainKeyId)
				.then(keyPair4 => {
					assert.isFalse(keyPair4.privateKey.identifier.equals(keyPair1Identifier));
				});
		});
	});
});
