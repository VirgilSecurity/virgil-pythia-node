import config from './rollup.config';

export default config({
	output: {
		file: 'dist/virgil-pythia.cjs.js',
		format: 'cjs'
	},
	isBrowser: false
})
