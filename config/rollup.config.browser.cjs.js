import config from './rollup.config';

export default config({
	output: {
		file: 'dist/virgil-pythia.browser.cjs.js',
		format: 'cjs'
	},
	isBrowser: true
})
