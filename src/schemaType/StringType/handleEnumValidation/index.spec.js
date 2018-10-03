import { assert } from 'chai';
import handleEnumValidation from './';

describe('handleEnumValidation', () => {
	it('should return an object with validator and message properties', () => {
		const validationObject = handleEnumValidation(true);
		assert.isObject(validationObject);
		assert.hasAllKeys(validationObject, ['validator', 'message']);
	});

	it('should format the default message', () => {
		const { message } = handleEnumValidation();
		assert.strictEqual(message, 'Value not present in list of allowed values');
	});

	it('should return the specified validation function', () => {
		const { validator } = handleEnumValidation('foo');
		assert.strictEqual(validator, 'foo');
	});
});
