import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

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
		})
	],
	treeshake: {
		pureExternalModules: true
	},
	...config
});
