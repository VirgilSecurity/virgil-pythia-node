import config from './rollup.config';

export default config({
	output: {
		file: 'dist/virgil-pythia.browser.umd.js',
		format: 'umd',
		name: 'VirgilPythia'
	},
	isBrowser: true
});
