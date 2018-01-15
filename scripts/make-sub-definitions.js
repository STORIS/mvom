/* eslint-disable no-console */
import fs from 'fs-extra';
import nunjucks from 'nunjucks';
import path from 'path';
import getFeatureVersion from 'shared/getFeatureVersion';

const inputDirs = [
	path.join(process.cwd(), 'src', 'templates', 'config'),
	path.join(process.cwd(), 'src', 'templates', 'unibasic'),
];

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(inputDirs), {
	noCache: true,
	trimBlocks: true,
});

const inputFile = 'cm_sub_definitions.njk';
const buildPath = path.join(process.cwd(), 'dist', '.cm_sub_definitions.xml');
try {
	fs.writeFileSync(buildPath, env.render(inputFile, { version: getFeatureVersion('entry') }));
	console.log(`transformed ${inputFile} to ${buildPath}`);
} catch (err) {
	console.log(`failed to transform ${inputFile} to ${buildPath}`);
	console.log(err);
	process.exit(1);
}
