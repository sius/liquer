import { Writable } from 'stream';
import * as moment from 'moment';
import * as os from 'os';

export const mvn = /^Windows_NT/.test(os.type()) ? 'mvn.cmd' : 'mvn';

export function isArray(obj: any): boolean {
  return (!!obj) && (obj.constructor === Array);
}

export function timestamp(date: Date = null): string {
  const d = date ? date : Date.now();
  return moment(d).format('YYYYMMDD-HHmmss-SSS');
}

const _devnullPushEvent = (f) => setTimeout(f,0);
export function devnull(options?: any): Writable {
  const opts = options || { };
  return new Writable({
    ...opts,
    write(_chunk, _encoding, cb) {
      _devnullPushEvent(cb);
    }
  });
}
