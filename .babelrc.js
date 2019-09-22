module.exports = {
	ignore: ['**/*.d.ts'],
	env: {
		build: {
			ignore: ['**/*.spec.js', '**/__mocks__/**'],
			presets: [['@babel/env', { targets: { node: '8.16.0' } }], '@babel/typescript'],
		},
		test: { plugins: ['rewire'] },
		testDebug: { plugins: ['rewire'], sourceMaps: true, retainLines: true },
	},
	presets: [['@babel/env', { targets: { node: 'current' } }], '@babel/typescript'],
	plugins: [
		'@babel/proposal-class-properties',
		[
			'module-resolver',
			{
				extensions: ['.js', '.ts'],
				alias: {
					'#shared': './src/shared',
					'#sharedjs': './srcjs/shared',
					'#test': './test',
				},
			},
		],
	],
};
