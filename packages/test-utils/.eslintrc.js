module.exports = {
	extends: ['@storis/eslint-config/nodejs'],

	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.eslint.json'],
	},

	overrides: [
		{
			files: ['./.*.js', './*.js'],
			rules: {
				// allow requires in config files
				'@typescript-eslint/no-var-requires': 'off',
			},
		},
	],
};
