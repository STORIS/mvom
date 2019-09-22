module.exports = {
	ignore: ['**/*.d.ts'],
	env: {
		build: {
			ignore: ['**/*.test.ts', '**/__mocks__/**', '**/*.spec.js'],
			presets: [['@babel/env', { targets: { node: '8.16.0' } }], '@babel/typescript'],
		},
		test: { plugins: ['rewire-ts'] },
		testDebug: { plugins: ['rewire-ts'], sourceMaps: true, retainLines: true },
	},
	presets: [['@babel/env', { targets: { node: 'current' } }], '@babel/typescript'],
	plugins: [
		'@babel/proposal-class-properties',
		[
			'module-resolver',
			{
				extensions: ['.js', '.ts'],
				alias: {
					'#shared': './src/ts/shared',
					'#sharedjs': './src/js/shared',
					'#test': './test',
				},
			},
		],
	],
};
