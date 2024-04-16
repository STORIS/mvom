const { jsTsGlobs, tsGlobs } = require('./globs');

module.exports = {
	overrides: [
		{
			files: jsTsGlobs,
			extends: ['airbnb-base', 'airbnb-typescript/base', './shared'],

			rules: {
				// set up naming convention rules
				'@typescript-eslint/naming-convention': [
					'error',
					// camelCase for everything not otherwise indicated
					{ selector: 'default', format: ['camelCase'] },
					// allow known default exclusions
					{ selector: 'default', filter: { regex: '^(_id|__v|_raw)$', match: true }, format: null },
					// allow variables to be camelCase or UPPER_CASE
					{ selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
					// allow known variable exclusions
					{
						selector: 'variable',
						filter: { regex: '^(_id|__v|_raw)$', match: true },
						format: null,
					},
					// GraphQL variables PascalCase
					{
						selector: 'variable',
						filter: { regex: '^.*Gql$', match: true },
						format: ['PascalCase'],
					},
					// do not enforce format on property names
					{ selector: 'property', format: null },
					// PascalCase for classes and TypeScript keywords
					{
						selector: ['typeLike'],
						format: ['PascalCase'],
					},
					// allow trailing ASC and DESC on enumerations
					{
						selector: 'enumMember',
						filter: { regex: '^.*?_(ASC|DESC)$', match: true },
						format: null,
					},
				],
			},
		},
		{
			files: tsGlobs,
			rules: {
				// enforce return types on module boundaries
				'@typescript-eslint/explicit-module-boundary-types': 'error',
			},
		},

		{
			files: ['**/*.types.ts', '**/types/*.ts', '**/*.schema.ts', '**/instances/**'],
			rules: {
				'import/prefer-default-export': 'off',
				'import/no-default-export': 'error',
			},
		},
	],
};
