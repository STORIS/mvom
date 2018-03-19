import { stub } from 'sinon';

const mockLogger = {
	error: stub(),
	warn: stub(),
	info: stub(),
	verbose: stub(),
	debug: stub(),
	silly: stub(),
};

export default mockLogger;
