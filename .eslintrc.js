const { rules: baseRules } = require('@storis/eslint-config/nodejs');

const baseNamingRules = baseRules['@typescript-eslint/naming-convention'].slice(1);

module.exports = {
	extends: ['@storis/eslint-config/nodejs'],

	parserOptions: { tsconfigRootDir: __dirname, project: './tsconfig.eslint.json' },

	settings: { 'import/resolver': { 'babel-module': { extensions: ['.js', '.ts'] } } },

	globals: { __rewire_reset_all__: false },

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
			files: ['**/*.js'],
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
					// allow class methods to lead with underscores
					{ selector: 'classMethod', format: ['camelCase'], leadingUnderscore: 'allow' },
					...baseNamingRules,
				],
			},
		},

		{
			files: ['**/*.spec.js'],
			rules: {
				// allow tests to create multiple classes
				'max-classes-per-file': 'off',

				// allow side effect constructors
				'no-new': 'off',

				// allow import with CommonJS export
				'import/no-import-module-exports': 'off',

				// allow dev dependencies
				'import/no-extraneous-dependencies': [
					'error',
					{ devDependencies: true, optionalDependencies: false, peerDependencies: false },
				],

				// allow explicit any in tests
				'@typescript-eslint/no-explicit-any': 'off',

				// allow non-null-assertions
				'@typescript-eslint/no-non-null-assertion': 'off',

				// disallow use of "it" for test blocks
				'jest/consistent-test-it': ['error', { fn: 'test', withinDescribe: 'test' }],

				// ensure all tests contain an assertion
				'jest/expect-expect': 'error',

				// no commented out tests
				'jest/no-commented-out-tests': 'error',

				// no duplicate test hooks
				'jest/no-duplicate-hooks': 'error',

				// valid titles
				'jest/valid-title': 'error',

				// no if conditionals in tests
				'jest/no-if': 'error',

				// expect statements in test blocks
				'jest/no-standalone-expect': 'error',

				// disallow returning from test
				'jest/no-test-return-statement': 'error',

				// disallow truthy and falsy in tests
				'jest/no-restricted-matchers': ['error', { toBeFalsy: null, toBeTruthy: null }],

				// prefer called with
				'jest/prefer-called-with': 'error',

				// allow empty arrow functions
				'@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],

				'@typescript-eslint/naming-convention': [
					'error',
					// allow parameters and variables to be named "Model"
					{
						selector: ['parameter', 'variable'],
						filter: { regex: '^Model$', match: true },
						format: ['PascalCase'],
					},
					// allow variables to be camelCase or UPPER_CASE and have leading underscore
					{ selector: 'variable', format: ['camelCase', 'UPPER_CASE'], leadingUnderscore: 'allow' },
					...baseNamingRules,
				],
			},
		},

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
