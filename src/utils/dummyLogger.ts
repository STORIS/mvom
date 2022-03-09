import type { Logger } from '../types';

const dummyLogger: Logger = {
	error: () => {},
	warn: () => {},
	info: () => {},
	verbose: () => {},
	debug: () => {},
	silly: () => {},
};

export default dummyLogger;
