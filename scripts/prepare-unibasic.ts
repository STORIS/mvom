/* eslint-disable no-console */
import path from 'path';
import fs from 'fs-extra';
import nunjucks from 'nunjucks';
import { dbErrors } from '../src/constants';

const inputDir = path.join(process.cwd(), 'src', 'unibasicTemplates');
const outputDir = path.join(process.cwd(), 'dist', 'unibasic');

const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(inputDir), {
	noCache: true,
	trimBlocks: true,
});

/** Empty (or create) the output directory */
const emptyOutputDir = () => {
	try {
		fs.emptyDirSync(outputDir);
		console.log(`created or emptied the directory located at ${outputDir}`);
	} catch (err) {
		console.log(`failed to create or empty the directory located at ${outputDir}`);
		process.exit(1);
	}
};

/** Process file */
const processFile = (filename: string): void => {
	const outputFile = `${path.parse(filename).name}.mvb`;
	const buildPath = path.join(outputDir, outputFile);
	try {
		fs.writeFileSync(buildPath, env.render(filename, { dbErrors }));
		console.log(`transformed ${filename} to ${buildPath}`);
	} catch (err) {
		console.log(`failed to transform ${filename} to ${buildPath} - ${err}`);
		process.exit(1);
	}
};

/** Build UniBasic files from Nunjucks templates */
const buildFromTemplates = (): void => {
	try {
		fs.readdirSync(inputDir)
			.filter((file) => fs.statSync(path.join(inputDir, file)).isFile())
			.forEach((inputFile) => {
				processFile(inputFile);
			});
	} catch (err) {
		console.log(`failed to transform files from ${inputDir}`);
		process.exit(1);
	}
};

// launch preparation tasks
emptyOutputDir();
buildFromTemplates();
