import TransformDataError from '../TransformDataError';

const transformClass = 'className';
const transformValue = 'transformValue';

test('should instantiate error with expected instance properties', () => {
	const error = new TransformDataError({ transformClass, transformValue });
	const expected = {
		name: 'TransformDataError',
		message: 'Error transforming data from multivalue format',
		transformClass,
		transformValue,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', () => {
	const message = 'foo';
	const error = new TransformDataError({
		message,
		transformClass,
		transformValue,
	});
	expect(error.message).toEqual(message);
});
