module.exports = {
	ignore: ['**/*.d.ts'],
	env: {
		build: {
			ignore: ['**/*.spec.js', '**/__mocks__/**'],
			presets: [['@babel/env', { targets: { node: '8.16.0' } }]],
		},
		test: { plugins: ['rewire'] },
		testDebug: { plugins: ['rewire'], sourceMaps: true, retainLines: true },
	},
	presets: [['@babel/env', { targets: { node: 'current' } }]],
	plugins: [
		'@babel/proposal-class-properties',
		[
			'module-resolver',
			{
				alias: {
					'#shared': './src/shared',
					'#test': './test',
				},
			},
		],
	],
};
