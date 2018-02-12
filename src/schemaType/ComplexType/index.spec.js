import { assert } from 'chai';
import ComplexType from './';

describe('ComplexType', () => {
	describe('constructor', () => {
		const Extension = class extends ComplexType {};

		it('should not be able to instantiate directly', () => {
			assert.throws(() => new ComplexType());
		});

		it('should return an instance of the child class', () => {
			assert.instanceOf(new Extension(), ComplexType);
		});
	});
});
