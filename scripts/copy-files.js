/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path';
import packageData from '../package.json';

const getBuildPath = file => path.join(process.cwd(), 'dist', path.basename(file));

const files = ['README.md', 'CHANGELOG.md', 'LICENSE', path.join('src', '.mvomrc.json')];
files.forEach(file => {
	const buildPath = getBuildPath(file);
	try {
		fs.copySync(file, buildPath);
		console.log(`copied ${file} to ${buildPath}`);
	} catch (err) {
		console.log(`failed to copy ${file} to ${buildPath}`);
		process.exit(1);
	}
});

const {
	author,
	version,
	description,
	keywords,
	repository,
	license,
	bugs,
	homepage,
	peerDependencies,
	dependencies,
} = packageData;

const minimalPackage = {
	name: 'mvom',
	author,
	version,
	description,
	main: './index.js',
	keywords,
	repository,
	license,
	bugs,
	homepage,
	peerDependencies,
	dependencies,
};

const buildPath = getBuildPath('package.json');
try {
	fs.writeJSONSync(buildPath, minimalPackage, { spaces: 2 });
	console.log(`created package.json in ${buildPath}`);
} catch (err) {
	console.log(`failed to create package.json in ${buildPath}`);
	process.exit(1);
}
