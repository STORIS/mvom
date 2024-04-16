const jsGlobs = ['**/*.?([cm])js', '**/*.js?(x)'];

const tsGlobs = ['**/*.?([cm])ts', '**/*.ts?(x)'];

const jsTsGlobs = [...jsGlobs, ...tsGlobs];

module.exports = {
	jsGlobs,
	tsGlobs,
	jsTsGlobs,
};
