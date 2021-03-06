/* eslint-disable no-console */
import { createHash } from 'crypto';
import path from 'path';
import fs from 'fs-extra';
import nunjucks from 'nunjucks';
import { dbErrors } from '../src/constants';

const inputDir = path.join(process.cwd(), 'src', 'unibasicTemplates');
const inputFile = path.join(inputDir, 'main.njk');
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

/** Calculate a hash for the file */
const calculateHash = (data: string): string =>
	createHash('shake256', { outputLength: 4 }).update(data).digest('hex');

/** Process file */
const processFile = (): void => {
	try {
		const rendered = env.render(inputFile, { dbErrors });
		try {
			const hash = calculateHash(rendered);
			const outputFile = `mvom_${path.parse(inputFile).name}@${hash}.mvb`;
			const buildPath = path.join(outputDir, outputFile);
			try {
				fs.writeFileSync(buildPath, rendered);
				console.log(`transformed ${inputFile} to ${buildPath}`);
			} catch (err) {
				console.error(`failed to transform ${inputFile} to ${buildPath} - ${err}`);
				process.exit(1);
			}
		} catch (err) {
			console.error(`failed to calculate the hash for ${inputFile} - ${err}`);
			process.exit(1);
		}
	} catch (err) {
		console.error(`failed to render ${inputFile} - ${err}`);
		process.exit(1);
	}
};

// launch preparation tasks
emptyOutputDir();
processFile();
