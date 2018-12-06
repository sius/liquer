import * as os from 'os';
export const mvn = /^Windows_NT/.test(os.type()) ? 'mvn.cmd' : 'mvn';
