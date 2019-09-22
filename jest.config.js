module.exports = {
	testEnvironment: 'node',
	resetMocks: true, // clear history and reset behavior of mocks between each test
	restoreMocks: true, // restore initial behavior of mocked functions
	collectCoverageFrom: [
		'**/*.ts', // test typescript files
		'srcjs/**/*.js', // test unconverted source javascript files
		'!**/node_modules/**', // do not test node_modules
		'!**/__mocks__/**', // do not test jest mocks
		'!**/test/**', // do not test any test helpers
		'!**/src/**/index.*', // do not test index export files
		'!**/src/@types/**', // do not test ambient declarations
		'!**/index.d.ts', // do not test typescript declaration files
		'!src/shared/typedefs/**', // do not test jsdoc type definitions
	],
	coverageThreshold: {
		global: {
			branches: 0,
			functions: 0,
			lines: 0,
			statements: 0,
		},
	},
};
