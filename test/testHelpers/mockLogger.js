import { stub } from 'sinon';

const mockLogger = { error: stub(), info: stub(), verbose: stub(), debug: stub(), silly: stub() };

export default mockLogger;
