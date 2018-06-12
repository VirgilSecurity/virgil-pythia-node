import config from './rollup.config';

export default config({
	output: {
		file: 'dist/virgil-pythia.umd.js',
		format: 'umd',
		name: 'VirgilPythia'
	},
	isBrowser: true
});
