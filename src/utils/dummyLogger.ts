import type { Logger } from '../Connection';

const dummyLogger: Logger = {
	error: () => {},
	warn: () => {},
	info: () => {},
	verbose: () => {},
	debug: () => {},
	silly: () => {},
};

export default dummyLogger;
