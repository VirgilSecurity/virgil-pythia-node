import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import inject from 'rollup-plugin-inject';
import globals from 'rollup-plugin-node-globals';
import builtinModules from 'builtin-modules';
import pkg from '../package.json';

export default ({ output, isBrowser, ...config }) => ({
	input: 'src/index.js',
	output: output,
	plugins: [
		resolve({ browser: isBrowser }),
		commonjs({
			namedExports: {
				'node_modules/cross-fetch/dist/browser-ponyfill.js': [ 'fetch', 'Headers', 'Request', 'Response' ]
			}
		}),
		babel({
			exclude: 'node_modules/**'
		}),
		...(isBrowser ? [
			globals(),
			inject({
				exclude: 'node_modules/**',
				modules: {
					Buffer: [ 'buffer-es6', 'Buffer' ]
				}
			})
		] : []),
	],
	treeshake: {
		pureExternalModules: true
	},
	external: isBrowser ? [] : [ ...builtinModules, ...Object.keys(pkg.dependencies) ],
	...config
});
