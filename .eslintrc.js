module.exports = {
	extends: ['airbnb-base', 'plugin:prettier/recommended'],
	env: { es6: true, node: true, jest: true },
	globals: {
		__rewire_reset_all__: false,
	},
	parser: 'babel-eslint',
	rules: {
		// arrow-body-style must be manually enabled because prettier/recommended is disabling it
		// see https://github.com/prettier/eslint-config-prettier/blob/master/CHANGELOG.md v4.0.0
		'arrow-body-style': ['error', 'as-needed', { requireReturnForObjectLiteral: false }],
		// prefer-arrow-callback must be manually enabled because prettier/recommended is disabling it
		// see https://github.com/prettier/eslint-config-prettier/blob/master/CHANGELOG.md v4.0.0
		'prefer-arrow-callback': ['error', { allowNamedFunctions: false, allowUnboundThis: true }],
		// allow dangling _id and __v
		'no-underscore-dangle': [
			'error',
			{ allow: ['_id', '__v', '__Rewire__', '__ResetDependency__'], allowAfterThis: true },
		],
	},
	settings: { 'import/resolver': { 'babel-module': {} } },
	overrides: [
		{
			files: ['**/index.js'],
			parser: 'babel-eslint',
			rules: {
				// in index files, always use named exports
				'import/prefer-default-export': 'off',
				'import/no-default-export': 'error',
			},
		},
		{
			files: ['**/*.spec.js', '**/scripts/**'],
			parser: 'babel-eslint',
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
