module.exports = {
	extends: '../../babel.config.js',
	env: {
		build: {
			ignore: ['**/*.test.ts', '**/__mocks__/**'],
			presets: [['@babel/env', { targets: { node: '14.19.0' } }], '@babel/typescript'],
		},
		debug: { sourceMaps: 'inline', retainLines: true },
	},
};
