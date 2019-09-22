/* eslint-disable no-console */
import fs from 'fs-extra';
import nunjucks from 'nunjucks';
import path from 'path';
import { dbErrors } from '#sharedjs/constants';

const inputDir = path.join(process.cwd(), 'src', 'unibasicTemplates');
const outputDir = path.join(process.cwd(), 'dist', 'unibasic');

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(inputDir), {
	noCache: true,
	trimBlocks: true,
});

try {
	fs.emptyDirSync(outputDir);
	console.log(`created or emptied the directory located at ${outputDir}`);
} catch (err) {
	console.log(`failed to create or empty the directory located at ${outputDir}`);
	process.exit(1);
}

try {
	const fileList = fs
		.readdirSync(inputDir)
		.filter(file => fs.statSync(path.join(inputDir, file)).isFile());

	fileList.forEach(inputFile => {
		const outputFile = `${path.parse(inputFile).name}.mvb`;
		const buildPath = path.join(outputDir, outputFile);
		try {
			fs.writeFileSync(buildPath, env.render(inputFile, { dbErrors }));
			console.log(`transformed ${inputFile} to ${buildPath}`);
		} catch (err) {
			console.log(`failed to transform ${inputFile} to ${buildPath}`);
			process.exit(1);
		}
	});
} catch (err) {
	console.log(`failed to transform files from ${inputDir}`);
	process.exit(1);
}
