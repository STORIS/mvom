const { rules: baseRules } = require('../.eslintrc');

const baseNamingRules = baseRules['@typescript-eslint/naming-convention'].slice(1);

module.exports = {
	extends: '../.eslintrc.js',

	rules: {
		// set up naming convention rules
		'@typescript-eslint/naming-convention': [
			'error',
			// allow PascalCase functions
			{ selector: 'function', format: ['camelCase', 'PascalCase'] },
			...baseNamingRules,
		],

		'import/no-default-export': 'off',
		'import/prefer-default-export': 'error',
	},
};
