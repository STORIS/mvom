module.exports = {
	extends: [
		'airbnb-base',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
		'prettier/@typescript-eslint',
	],
	env: { es6: true, node: true, jest: true },
	globals: {
		__rewire_reset_all__: false,
	},
	parser: '@typescript-eslint/parser',
	rules: {
		// arrow-body-style must be manually enabled because prettier/recommended is disabling it
		// see https://github.com/prettier/eslint-config-prettier/blob/master/CHANGELOG.md v4.0.0
		'arrow-body-style': ['error', 'as-needed', { requireReturnForObjectLiteral: false }],
		// prefer-arrow-callback must be manually enabled because prettier/recommended is disabling it
		// see https://github.com/prettier/eslint-config-prettier/blob/master/CHANGELOG.md v4.0.0
		'prefer-arrow-callback': ['error', { allowNamedFunctions: false, allowUnboundThis: true }],
		// allow dangling _id and __v
		'no-underscore-dangle': ['error', { allow: ['_id', '__v'] }],
		// make ts camelcase rule line up with airbnb variant
		'@typescript-eslint/camelcase': ['error', { properties: 'never', ignoreDestructuring: false }],
		// make ts no-unused-vars rule line up with airbnb variant
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ vars: 'all', args: 'after-used', ignoreRestSiblings: true },
		],
		// allow class methods which do not use this
		'class-methods-use-this': ['off'],
	},
	settings: { 'import/resolver': { 'babel-module': {} } },
	overrides: [
		{
			files: ['**/*.ts'],
			rules: {
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
			parser: 'babel-eslint',
			rules: {
				// allow dangling _id and __v, use of rewire, and implicitly private class members
				'no-underscore-dangle': [
					'error',
					{ allow: ['_id', '__v', '__Rewire__', '__ResetDependency__'], allowAfterThis: true },
				],
				// ignore typescript rules
				'@typescript-eslint/explicit-function-return-type': 'off',
				'@typescript-eslint/member-ordering': 'off',
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
