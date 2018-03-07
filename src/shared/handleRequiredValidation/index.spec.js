import { assert } from 'chai';
import handleRequireValidation from './';

describe('handleRequireValidation', () => {
	it('should return an object with validator property if no parameters are passed', () => {
		const validationObject = handleRequireValidation();
		assert.isObject(validationObject);
		assert.hasAllKeys(validationObject, 'validator');
	});

	it('should return an object with validator and message properties if required is true', () => {
		const validationObject = handleRequireValidation(true);
		assert.isObject(validationObject);
		assert.hasAllKeys(validationObject, ['validator', 'message']);
	});

	it('should format the default message', () => {
		const { message } = handleRequireValidation(true);
		assert.strictEqual(message, 'Property is required');
	});

	it('should allow message to be overridden', () => {
		const { message } = handleRequireValidation([true, 'foo']);
		assert.strictEqual(message, 'foo');
	});

	it('should return a function that resolves to true if required validation is false', async () => {
		const { validator } = handleRequireValidation(false);
		assert.isTrue(await validator());
	});

	it('should return the passed defaultValidator if required is true', () => {
		const { validator } = handleRequireValidation(true, 'foo');
		assert.strictEqual(validator, 'foo');
	});

	it('should return the override validator if required is a function', async () => {
		const { validator } = handleRequireValidation(async () => 'foo');
		assert.strictEqual(await validator(), 'foo');
	});
});
