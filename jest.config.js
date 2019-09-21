module.exports = {
	testEnvironment: 'node',
	resetMocks: true, // clear history and reset behavior of mocks between each test
	restoreMocks: true, // restore initial behavior of mocked functions
	collectCoverageFrom: [
		'src/**/*.js', // only test source javascript files
		'!**/__mocks__/**', // do not test jest mocks
		'!src/shared/typedefs/**', // do not test jsdoc type definitions
		'!**/src/**/index.js', // do not test index export files
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
