'use strict';

const fs = require('fs');
const path = require('path');
const format = require('util').format;
const fetch = require('node-fetch');
const yauzl = require('yauzl');
const zlib = require('zlib');
const tar = require('tar');
const tempy = require('tempy');
const crypto = require('crypto');

const destFilePath = path.resolve(__dirname + '/../virgil_crypto_nodejs.node');

const cryptoVersion = process.env.VIRGIL_CRYPTO_VERSION || '2.4.2';
const nodeVersion = getNodeVersion();
const platform = getPlatform();
const arch = getArch();

const Colors = {
	RED: '\x1b[31m',
	CYAN: '\x1b[36m',
	LIGHT_GREEN: '\x1b[92m',
	RESET: '\x1b[0m'
};

const archiveUrl = getFileUrl(cryptoVersion, nodeVersion, platform, arch);
const checksumUrl = archiveUrl + '.sha256';
const extractAddon = archiveUrl.slice(-3) === 'zip' ? extractFromZip : extractFromTgz;

Promise.all([
	downloadFile(archiveUrl),
	downloadFile(checksumUrl)
]).then(fileNames => {
	const archiveFileName = fileNames[0];
	const checksumFileName = fileNames[1];

	logInfo('Calculating checksum');
	return calculateChecksum(archiveFileName)
		.then(actualChecksum => {
			logInfo('Verifying checksum');
			const expectedChecksum = fs.readFileSync(checksumFileName, { encoding: 'utf8' });
			if (actualChecksum.toLowerCase().trim() !== expectedChecksum.toLowerCase().trim()) {
				throw new Error('Checksum verification has failed');
			}

			return archiveFileName;
		});
}).then(extractAddon)
	.then(() => {
		logSuccess('Successfully downloaded Virgil Crypto Node.js Addon');
	})
	.catch(logError);

function getPlatform () {
	if (process.platform === 'darwin') {
		return 'darwin-17.5';
	}

	if (process.platform === 'win32') {
		return 'windows-6.3';
	}

	return process.platform;
}

function getArch () {
	if (process.arch === 'x64' && process.platform !== 'win32') {
		return 'x86_64';
	}

	if (process.arch === 'ia32' && process.platform === 'win32') {
		return 'x86';
	}

	return process.arch;
}

function getNodeVersion () {
	const versionTokens = process.version.split('.');

	// Use same build for node 4.*.*
	if (versionTokens[0] === 'v4') {
		return '4.8.7';
	}

	// Use same build for node 6.*.*
	if (versionTokens[0] === 'v6') {
		return '6.13.0';
	}

	// Use same build for node 7.*.*
	if (versionTokens[0] === 'v7') {
		return '7.10.1';
	}

	// Use same build for node 8.*.*
	if (versionTokens[0] === 'v8') {
		return '8.9.4';
	}

	// Use same build for node 9.*.*
	if (versionTokens[0] === 'v9') {
		return '9.5.0';
	}

	return process.version.slice(1);
}

function getFileUrl(libVersion, nodeVersion, platform, arch) {
	return format(
		'https://cdn.virgilsecurity.com/virgil-crypto/nodejs/virgil-crypto-%s-nodejs-%s-%s-%s.%s',
		libVersion,
		nodeVersion,
		platform,
		arch,
		platform.platform === 'win32' ? 'zip' : 'tgz'
	);
}

function downloadFile(url) {
	logInfo('Downloading ' + url);

	return fetch(url).then(res => {
		if (!res.ok) {
			if (res.status === 404) {
				throw new Error('Your Node.js version or OS is not supported by virgil-crypto');
			}

			throw new Error('Failed to download Virgil Crypto Node.js Addon');
		}

		const tempFilePath = tempy.file();
		return new Promise((resolve, reject) => {
			const writer = fs.createWriteStream(tempFilePath);
			res.body.pipe(writer);
			res.body
				.on('end', () => {
					resolve(tempFilePath);
				})
				.on('error', (err) => {
					writer.close();
					reject(err);
				});
		});
	});
}

function extractFromTgz(filePath) {
	logInfo('Extracting');
	return new Promise((resolve, reject) => {
		fs.createReadStream(filePath)
			.pipe(new zlib.Unzip())
			.pipe(new tar.Parse())
			.on('entry', entry => {
				if (/\.node$/.test(entry.path)) {
					entry.pipe(fs.createWriteStream(destFilePath))
				} else {
					entry.resume();
				}
			})
			.on('end', resolve)
			.on('error', reject);
	});
}

function extractFromZip(filePath) {
	logInfo('Extracting');
	return new Promise((resolve, reject) => {
		yauzl.open(filePath, (err, zipFile) => {
			if (err) {
				return reject(err);
			}

			zipFile.on('entry', entry => {
				if (/\.node$/.test(entry.fileName)) {
					// the file we are looking for
					zipFile.openReadStream(entry, (err, readStream) => {
						if (err) {
							return reject(err);
						}

						readStream.pipe(fs.createWriteStream(destFilePath));
					});
				}
			});

			zipFile
				.on('end', resolve)
				.on('error', reject);
		});
	});
}

function calculateChecksum(filePath) {
	return new Promise((resolve, reject) => {
		const hash = crypto.createHash('sha256');
		const reader = fs.createReadStream(filePath);

		reader.on('data', chunk => {
			hash.update(chunk);
		});
		reader.on('end', () => {
			resolve(hash.digest('hex'));
		});
		reader.on('error', err => reject(err))
	});
}

function logError(err) {
	console.log(Colors.RED + 'pythia-node: ' + err.toString() + Colors.RESET);
}

function logInfo(message) {
	console.log(Colors.CYAN + 'pythia-node: ' + Colors.RESET + message);
}

function logSuccess(message) {
	console.log(Colors.LIGHT_GREEN + 'pythia-node: ' + Colors.RESET + message);
}
