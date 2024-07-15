import { AxiosError } from 'axios';
import TimeoutError from '../TimeoutError';

test('should instantiate error with expected instance properties', () => {
	const axiosError = new AxiosError();
	const error = new TimeoutError(axiosError);
	const expected = {
		name: 'TimeoutError',
		message: 'The request to the DB server timed out',
		cause: axiosError,
	};
	expect(error).toMatchObject(expected);
});

test('should allow for override of message', () => {
	const axiosError = new AxiosError();
	const message = 'foo';
	const error = new TimeoutError(axiosError, { message });
	expect(error.message).toEqual(message);
});
