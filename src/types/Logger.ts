export interface LogFunction {
	(message: string): void;
}

export interface Logger {
	error: LogFunction;
	warn: LogFunction;
	info: LogFunction;
	verbose: LogFunction;
	debug: LogFunction;
	silly: LogFunction;
}
