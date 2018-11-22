import { StreamOptions } from './stream-options';
import { Dependency } from './dependency';

function logStream(options: StreamOptions) {
  let count = 0;
  return (dependency: Dependency, cb: (err?: Error, line?: string) => void) => {
    cb(null, `${++count} ${dependency.bestLicense.name} ${dependency.bestLicense.url}\n`);
  };
}

export { logStream };
