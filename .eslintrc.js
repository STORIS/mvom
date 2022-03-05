const { rules: baseRules } = require('@storis/eslint-config/nodejs');

const baseNamingRules = baseRules['@typescript-eslint/naming-convention'].slice(1);

module.exports = {
	extends: ['@storis/eslint-config/nodejs'],

	parserOptions: { tsconfigRootDir: __dirname, project: './tsconfig.eslint.json' },

	rules: {
		// set up naming convention rules
		'@typescript-eslint/naming-convention': [
			'error',
			// allow parameters and variables to be named "Model"
			{
				selector: ['parameter', 'variable'],
				filter: { regex: '^Model$', match: true },
				format: ['PascalCase'],
			},
			...baseNamingRules,
		],
	},

	overrides: [
		{
			files: ['./.*.js', './*.js'],
			rules: {
				// allow requires in config files
				'@typescript-eslint/no-var-requires': 'off',
			},
		},

		{
			files: ['**/scripts/**'],
			rules: {
				// allow dev dependencies
				'import/no-extraneous-dependencies': [
					'error',
					{ devDependencies: true, optionalDependencies: false, peerDependencies: false },
				],
			},
		},
	],
};
