import type { DataTransformer } from '../types';

class ISOCalendarDateDataTransformer implements DataTransformer {
	public transformToQuery(value: unknown): unknown {
		throw new Error('Method not implemented.');
	}

	public transformFromDb(value: unknown): unknown {
		throw new Error('Method not implemented.');
	}

	public transformToDb(value: unknown): string | null {
		throw new Error('Method not implemented.');
	}
}
