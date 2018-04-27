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

const thePassword = 'my password';

pythia.register(thePassword)
	.then(user => {
		console.log('Registered');
		console.log(JSON.stringify(user));
		return user;
	})
	.then(user => {
		console.log('Trying to authenticate with wrong password');
		return pythia.authenticate('wrong password', user, false)
			.then(authenticated => {
				if (authenticated) {
					throw new Error('Authenticated with a wrong password');
				}

				console.log('Now the right password');
				return pythia.authenticate(thePassword, user, false);
			})
			.then(authenticated => {
				if (authenticated) {
					console.log('Welcome, %username%!');
					return;
				}

				throw new Error('Authentication failed with correct password');
			});
	})
	.catch(err => console.log(err));
