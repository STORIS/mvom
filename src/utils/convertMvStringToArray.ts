import type { DbServerDelimiters, MvRecord } from '../types';

/** Convert a multivalue string to an array */
const convertMvStringToArray = (
	recordString: string,
	dbServerDelimiters: DbServerDelimiters,
): MvRecord => {
	const { am, vm, svm } = dbServerDelimiters;
	const record: MvRecord =
		recordString === ''
			? []
			: recordString.split(am).map((attribute) => {
					if (attribute === '') {
						return null;
					}

					const attributeArray = attribute.split(vm);
					if (attributeArray.length === 1) {
						return attribute;
					}

					return attributeArray.map((value) => {
						if (value === '') {
							return null;
						}

						const valueArray = value.split(svm);
						if (valueArray.length === 1) {
							return value;
						}

						return valueArray.map((subvalue) => (subvalue === '' ? null : subvalue));
					});
			  });

	return record;
};

export default convertMvStringToArray;
