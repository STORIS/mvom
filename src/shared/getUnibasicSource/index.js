import fs from 'fs-extra';
import path from 'path';

const unibasicPath = path.resolve(path.join(__dirname, '../', '../', 'unibasic'));

const getUnibasicSource = async feature => {
	const filePath = path.join(unibasicPath, `${feature}.mvb`);
	return fs.readFile(filePath, 'utf8');
};
export default getUnibasicSource;
