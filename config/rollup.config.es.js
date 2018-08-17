import config from './rollup.config';

export default config({
	output: {
		file: 'dist/virgil-pythia.es.js',
		format: 'es'
	},
	isBrowser: false
})
