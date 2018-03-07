import { assert } from 'chai';
import DataValidationError from './';

describe('DataValidationError', () => {
	describe('constructor', () => {
		it('should set instance members with default values', () => {
			const error = new DataValidationError();
			assert.strictEqual(error.name, 'DataValidationError');
			assert.deepEqual(error.validationErrors, {});
			assert.strictEqual(error.message, 'Error(s) found while validating data');
		});

		it('should override default message', () => {
			const error = new DataValidationError({ message: 'foo' });
			assert.strictEqual(error.message, 'foo');
		});

		it('should override default validationErrors value', () => {
			const error = new DataValidationError({ validationErrors: 'foo' });
			assert.strictEqual(error.validationErrors, 'foo');
		});

		it('should destructure remaining properties into other property', () => {
			const error = new DataValidationError({ foo: 'bar' });
			assert.deepEqual(error.other, { foo: 'bar' });
		});
	});
});
