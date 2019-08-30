const path = require('path');

const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');
const typescript = require('rollup-plugin-typescript2');

const packageJson = require('./package.json');

const dependencies = Object.keys(packageJson.dependencies);
const peerDependencies = Object.keys(packageJson.peerDependencies);

const FORMAT = {
  CJS: 'cjs',
  ES: 'es',
  UMD: 'umd',
};

const sourcePath = path.join(__dirname, 'src');
const outputPath = path.join(__dirname, 'dist');

const createEntry = format => ({
  input: path.join(sourcePath, 'index.ts'),
  external: format === FORMAT.UMD ? peerDependencies : dependencies.concat(peerDependencies),
  output: {
    format,
    file: path.join(outputPath, `pythia.${format}.js`),
    name: 'VirgilPythia',
  },
  plugins: [
    format === FORMAT.UMD && nodeResolve({ browser: true }),
    format === FORMAT.UMD && commonjs(),
    typescript({
      exclude: ['**/*.test.ts'],
      useTsconfigDeclarationDir: true,
    }),
    format === FORMAT.UMD && terser(),
  ],
});

module.exports = Object.values(FORMAT).map(createEntry);
