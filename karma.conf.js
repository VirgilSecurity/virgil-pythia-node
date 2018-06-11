const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const json = require('rollup-plugin-json');
const inject = require('rollup-plugin-inject');
const globals = require('rollup-plugin-node-globals');

require('dotenv').config();

module.exports = function (config) {
	config.set({
		frameworks: [ 'mocha', 'chai' ],
		autoWatch: false,
		browsers: [ 'ChromeHeadless' ],
		files: [
			{ pattern: 'src/tests/index.js', watched: false }
		],
		colors: true,
		reporters: [ 'progress' ],
		logLevel: config.LOG_INFO,
		browserNoActivityTimeout: 60 * 1000,
		singleRun: true,

		preprocessors: {
			'src/**/*.js': [ 'rollup' ]
		},

		rollupPreprocessor: {
			plugins: [
				resolve({ browser: true }),
				commonjs({
					namedExports: {
						'node_modules/cross-fetch/dist/browser-ponyfill.js': [ 'fetch', 'Headers', 'Request', 'Response' ]
					}
				}),
				babel({
					exclude: 'node_modules/**'
				}),
				globals(),
				inject({
					exclude: 'node_modules/**',
					modules: {
						Buffer: [ 'buffer-es6', 'Buffer' ]
					}
				}),
				replace({
					'process.env.VIRGIL_API_KEY': JSON.stringify(process.env.VIRGIL_API_KEY),
					'process.env.VIRGIL_API_KEY_ID': JSON.stringify(process.env.VIRGIL_API_KEY_ID),
					'process.env.VIRGIL_APP_ID': JSON.stringify(process.env.VIRGIL_APP_ID),
					'process.env.VIRGIL_API_URL': JSON.stringify(process.env.VIRGIL_API_URL),
					'process.env.MY_PROOF_KEYS': JSON.stringify(process.env.MY_PROOF_KEYS),
					'process.env.MY_UPDATE_TOKEN': JSON.stringify(process.env.MY_UPDATE_TOKEN)
				}),

				json({
					include: 'src/tests/**/*.json'
				})
			],

			output: {
				format: 'iife',
				name: 'VirgilPythia',
				sourcemap: false
			}
		}
	});
};
