import config from './rollup.config';

export default config({
	output: {
		file: 'dist/virgil-pythia.browser.es.js',
		format: 'es'
	},
	isBrowser: true
})
