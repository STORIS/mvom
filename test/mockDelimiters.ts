import type { DbServerDelimiters } from '../src/types';

const mockDelimiters: DbServerDelimiters = {
	rm: String.fromCharCode(255),
	am: String.fromCharCode(254),
	vm: String.fromCharCode(253),
	svm: String.fromCharCode(252),
};

export default mockDelimiters;
