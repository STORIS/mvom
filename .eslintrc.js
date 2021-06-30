module.exports = {
	extends: ['airbnb-base'],
	env: { es6: true, node: true, jest: true },
	globals: {
		__rewire_reset_all__: false,
	},
	rules: {
		// allow class methods which do not use this
		'class-methods-use-this': ['off'],
		// disable import extensions for ts and js files
		'import/extensions': [
			'error',
			'ignorePackages',
			{
				ts: 'never',
				js: 'never',
			},
		],
	},
	settings: { 'import/resolver': { 'babel-module': {} } },
	overrides: [
		{
			files: ['**/*.ts'],
			parser: '@typescript-eslint/parser',
			parserOptions: { project: './tsconfig.json' },
			extends: [
				'plugin:@typescript-eslint/recommended',
				'plugin:import/typescript',
				'plugin:prettier/recommended',
			],
			plugins: ['@typescript-eslint'],
			rules: {
				// turn off eslint camelcase rule (handled by naming-convention)
				camelcase: 'off',
				// make naming convention rule consistent with airbnb camelcase
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
				// make ts no-unused-vars rule line up with airbnb variant
				'@typescript-eslint/no-unused-vars': [
					'error',
					{ vars: 'all', args: 'after-used', ignoreRestSiblings: true },
				],
				// enforce consistent order of class members
				'@typescript-eslint/member-ordering': 'error',
				// ensure consistent array typings
				'@typescript-eslint/array-type': 'error',
				// force explicit member accessibility modifiers
				'@typescript-eslint/explicit-member-accessibility': 'error',
				// disallow parameter properties in favor of explicit class declarations
				'@typescript-eslint/no-parameter-properties': 'error',
			},
		},
		{
			files: ['**/*.js'],
			parser: '@babel/eslint-parser',
			extends: ['plugin:prettier/recommended'],
			rules: {
				// allow _id, __v, and use of rewire
				'no-underscore-dangle': [
					'error',
					{ allow: ['_id', '__v', '__Rewire__', '__ResetDependency__'], allowAfterThis: true },
				],
			},
		},
		{
			files: ['**/index.*'],
			rules: {
				// in index files, always use named exports
				'import/prefer-default-export': 'off',
				'import/no-default-export': 'error',
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
		{
			files: ['**/test/**', '**/*.test.ts', '**/*.spec.js'],
			rules: {
				// allow explicit any in tests
				'@typescript-eslint/no-explicit-any': 'off',
				// allow dev dependencies
				'import/no-extraneous-dependencies': [
					'error',
					{ devDependencies: true, optionalDependencies: false, peerDependencies: false },
				],
				// allow non-null-assertions
				'@typescript-eslint/no-non-null-assertion': 'off',
				// allow ts-ignore in tests
				'@typescript-eslint/ban-ts-ignore': 'off',
				// allow tests to create multiple classes
				'max-classes-per-file': 'off',
			},
		},
	],
};
