#!/usr/bin/env node

require('babel-register');

const http = require('http');
const { transform } = require('./src/crypto/transform');
const { prove } = require('./src/crypto/prove');

// TransformationKeyPair would normally be generated during application registration
// this one was generated with the following parameters
// transformationKeyId = '968e4c446ced73e1d6f31070c6fb8344'
// pythiaScopeSecret = 'g7oqN9kaF5ltpRtVkwLKN0NU+gHnGXhQBEOOS0QWHds='
// pythiaSecret = 'eayxpO7DJ9oPBwWzdxsVKLRXMgxNWSC/HyvqJknEDJk='
const TransformationKeyPair = {
	privateKey: Buffer.from('AFfNBFnEJY4W7xg+JTQgkQhv/9LHdUInYL4izIRovfjX', 'base64'),
	publicKey: Buffer.from('AxATXqRhw15hzY6JzKXHqD8hfYzlXgVRkRhsdzVsdEDRp7ZJg5SNqgf5vzmQg5uh2Q==', 'base64')
};

const server = http.createServer((req, res) => {
	console.log(`Serving: ${req.method} ${req.url}`);
	if (req.url === '/pythia/v1/password') {
		if (req.method !== 'POST') {
			res.writeHead(405, 'Method Not Allowed');
			res.end();
		}

		let body = '';
		req.on('data', chunk => {
			body += chunk.toString();
		});
		req.on('end', () => {
			try {
				body = JSON.parse(body);
			} catch (e) {
				res.writeHead(400, 'Bad Request');
				res.end();
				return;
			}

			const result = doTransform(
				TransformationKeyPair,
				body.user_id,
				body.blinded_password,
				body.include_proof
			);
			const responseBody = JSON.stringify(result);

			res.writeHead(200, 'OK', {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(responseBody)
			});
			res.end(responseBody, 'utf8');
		});
	} else {
		res.writeHead(404, 'Not Found');
		res.end();
	}
});

function doTransform(keyPair, userId, blindedPassword, includeProof) {
	userId = Buffer.from(userId, 'base64');
	blindedPassword = Buffer.from(blindedPassword, 'base64');

	const { transformedPassword, transformedTweak } = transform(
		blindedPassword,
		userId,
		keyPair.privateKey
	);

	if (!includeProof) {
		return { transformed_password: transformedPassword.toString('base64') };
	}

	const { proofValueC, proofValueU } = prove(
		transformedPassword,
		blindedPassword,
		transformedTweak,
		keyPair
	);

	return {
		transformed_password: transformedPassword.toString('base64'),
		proof: {
			value_c: proofValueC.toString('base64'),
			value_u: proofValueU.toString('base64')
		}
	};
}

const port = process.env.PORT || 8080;

server.listen(port, () => {
	console.log(`Fake Pythia server listening on ${port}...`);
});

process.on('SIGINT', () => {
	console.log('Shutdown started');
	server.close(() => {
		console.log('Process is stopping');
	});
});
