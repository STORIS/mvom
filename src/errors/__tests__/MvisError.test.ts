import { AxiosError } from 'axios';
import MvisError from '../MvisError';

test('should instantiate error with expected instance properties', (): void => {
	const axiosError = new AxiosError();
	const error = new MvisError(axiosError);
	const expected = {
		name: 'MvisError',
		message: 'Error in MVIS communication',
		cause: axiosError,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', (): void => {
	const axiosError = new AxiosError();
	const message = 'foo';
	const error = new MvisError(axiosError, { message });
	expect(error.message).toEqual(message);
});
