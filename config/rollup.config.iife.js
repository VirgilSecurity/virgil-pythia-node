import config from './rollup.config';

export default config({
	output: {
		file: 'dist/virgil-pythia.iife.js',
		format: 'iife',
		name: 'VirgilPythia'
	},
	isBrowser: true
});
