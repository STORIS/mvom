module.exports = {
	testEnvironment: 'node',
	resetMocks: true, // clear history and reset behavior of mocks between each test
	restoreMocks: true, // restore initial behavior of mocked functions
	testPathIgnorePatterns: ['/node_modules/', '/dist/'], // ignore dist folder
	collectCoverageFrom: [
		'**/*.ts', // test typescript files
		'!**/node_modules/**', // do not test node_modules
		'!**/__mocks__/**', // do not test jest mocks
		'!**/test/**', // do not test any test helpers
		'!**/src/**/index.*', // do not test index export files
		'!**/src/**/types/**', // do not test local type definitions
		'!**/@types/**', // do not test ambient declarations
		'!**/index.d.ts', // do not test typescript declaration files
		'!**/src/**/constants/**', // do not test shared constants folder
		'!dist/**', // do not test compiled output
	],
	coverageThreshold: {
		global: {
			branches: 98,
			functions: 98,
			lines: 98,
			statements: 98,
		},
	},
};
