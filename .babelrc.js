module.exports = {
	ignore: ['**/*.d.ts'],
	env: {
		build: {
			ignore: ['**/*.test.ts', '**/__mocks__/**', '**/*.spec.js'],
			presets: [['@babel/env', { targets: { node: '12.22.0' } }], '@babel/typescript'],
		},
		test: { plugins: ['rewire-ts'] },
		testDebug: { plugins: ['rewire-ts'], sourceMaps: true, retainLines: true },
	},
	presets: [['@babel/env', { targets: { node: 'current' } }], '@babel/typescript'],
	plugins: [
		['@babel/plugin-transform-runtime'],
		[
			'module-resolver',
			{
				extensions: ['.js', '.ts'],
				alias: {
					'#shared': './src/ts/shared',
					'#test': './test',
				},
			},
		],
	],
};
