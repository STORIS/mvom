module.exports = {
	ignore: ['**/*.d.ts'],
	env: {
		build: {
			ignore: ['**/*.test.ts', '**/__mocks__/**'],
			presets: [['@babel/env', { targets: { node: '16.19.1' } }], '@babel/typescript'],
		},
		debug: { sourceMaps: 'inline', retainLines: true },
	},
	presets: [['@babel/env', { targets: { node: 'current' } }], '@babel/typescript'],
	plugins: [
		['@babel/plugin-transform-runtime'],
		[
			'module-resolver',
			{
				extensions: ['.ts'],
				alias: {
					'#test': './test',
				},
			},
		],
	],
};
