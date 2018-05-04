require('babel-register');
require('dotenv').config();

const { createPythia } = require('../src/pythia/createPythia');
const { ProofKeys } = require('../src/pythia/ProofKeys');

const proofKeyList = process.env.MY_PROOF_KEYS.split(';');

const pythia = createPythia({
	apiKeyBase64: process.env.VIRGIL_API_KEY,
	apiKeyId: process.env.VIRGIL_API_KEY_ID,
	appId: process.env.VIRGIL_APP_ID,
	proofKeys: proofKeyList[0],
	apiUrl: process.env.VIRGIL_API_URL
});

const updateToken = process.env.MY_UPDATE_TOKEN;

const thePassword = 'my password';

pythia.createBreachProofPassword(thePassword)
	.then(bpPassword => {
		console.log('Registered');
		console.log(JSON.stringify(bpPassword));
		return bpPassword;
	})
	.then(bpPassword =>  testAuthentication(bpPassword))
	.then(bpPassword => testUpdate(bpPassword))
	.then(updatedBpPassword => testAuthentication(updatedBpPassword))
	.catch(err => console.log(err));

function testAuthentication(bpPassword) {
	console.log('Trying to authenticate with wrong password');
	return pythia.verifyBreachProofPassword('wrong password', bpPassword, false)
		.then(authenticated => {
			if (authenticated) {
				throw new Error('Authenticated with a wrong password');
			}

			console.log('Now the right password');
			return pythia.verifyBreachProofPassword(thePassword, bpPassword, true);
		})
		.then(authenticated => {
			if (!authenticated) {
				throw new Error('Authentication failed with correct password');
			}

			console.log('Welcome, %username%!');
			return bpPassword;
		});
}

function testUpdate(bpPassword) {
	console.log('setting new proof key');
	pythia.proofKeys = new ProofKeys(proofKeyList);
	console.log('Updating the breach-proof password');
	const newBpPassword = pythia.updateBreachProofPassword(updateToken, bpPassword);
	console.log('New bpPassword');
	console.log(JSON.stringify(newBpPassword));
	return newBpPassword;
}
