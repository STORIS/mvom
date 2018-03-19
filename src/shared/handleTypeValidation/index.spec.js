import { assert } from 'chai';
import handleTypeValidation from './';

describe('handleTypeValidation', () => {
	it('should return an object with validator and message properties', () => {
		const validationObject = handleTypeValidation(true);
		assert.isObject(validationObject);
		assert.hasAllKeys(validationObject, ['validator', 'message']);
	});

	it('should format the default message', () => {
		const { message } = handleTypeValidation();
		assert.strictEqual(message, 'Property cannot be cast into the defined type');
	});

	it('should return the specified validation function', () => {
		const { validator } = handleTypeValidation('foo');
		assert.strictEqual(validator, 'foo');
	});
});
