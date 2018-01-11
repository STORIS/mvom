import mvom from 'mvom';

const startup = async () => {
	try {
		await mvom.connect('http://localhost:9191', { account: 'ESALES_DEV', sourceDir: 'mvom.bp' });
	} catch (err) {
		console.log(err); // eslint-disable-line no-console
	}
};

startup();
