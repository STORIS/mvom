import fs from 'fs-extra';
import path from 'path';

const unibasicPath = path.resolve(path.join(__dirname, '../', '../', 'unibasic'));

/**
 * Get the UniBasic source code for a given feature
 * @private
 * @async
 * @param {string} feature - Feature name
 * @returns {string} UniBasic source code
 */
const getUnibasicSource = async feature => {
	const filePath = path.join(unibasicPath, `${feature}.mvb`);
	return fs.readFile(filePath, 'utf8');
};
export default getUnibasicSource;
