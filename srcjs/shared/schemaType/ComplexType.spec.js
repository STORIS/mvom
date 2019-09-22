import ComplexType from './ComplexType';

describe('ComplexType', () => {
	describe('constructor', () => {
		const Extension = class extends ComplexType {};

		test('should not be able to instantiate directly', () => {
			expect(() => new ComplexType()).toThrow();
		});

		test('should return an instance of the child class', () => {
			expect(new Extension()).toBeInstanceOf(ComplexType);
		});
	});
});
