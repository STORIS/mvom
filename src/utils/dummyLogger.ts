import type { Logger } from '../shared/types';

const dummyLogger: Logger = {
	error: () => {},
	warn: () => {},
	info: () => {},
	verbose: () => {},
	debug: () => {},
	silly: () => {},
};

export default dummyLogger;
