const { overrides: baseOverrides } = require('@storis/eslint-config/nodejs');

const baseNamingRules = baseOverrides[0].rules['@typescript-eslint/naming-convention'].slice(1);

module.exports = {
	extends: ['@storis/eslint-config/nodejs'],

	settings: {
		'import/resolver': {
			'babel-module': {},
		},
	},

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
			files: ['./.*.js', './*.js', './website/**/*.js'],
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
