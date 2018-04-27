require('babel-register');
require('dotenv').config();

const { createPythia } = require('../src/pythia/createPythia');

const pythia = createPythia({
	apiKeyBase64: process.env.VIRGIL_API_KEY,
	apiKeyId: process.env.VIRGIL_API_KEY_ID,
	appId: process.env.VIRGIL_APP_ID,
	proofKeys: process.env.MY_PROOF_KEYS,
	apiUrl: process.env.VIRGIL_API_URL
});

pythia.register('my password')
	.then(user => console.log(JSON.stringify(user)))
	.catch(err => console.log(err));
