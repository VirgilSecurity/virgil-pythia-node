import config from './rollup.config';
import builtinModules from 'builtin-modules';

export default config({
	output: {
		file: 'dist/virgil-pythia.cjs.js',
		format: 'cjs'
	},
	isBrowser: false,
	external: (id) => {
		return builtinModules.indexOf(id) > -1 || (id.length > 5 && id.slice(-5) === '.node');
	}
})
