import { StreamOptions } from './stream-options';
import { Dependency } from './dependency';

function repoDbStream(options: StreamOptions) {

  return (d: Dependency, cb: (err?: Error, d?: Dependency) => void) => {

    options.repoDb.insert(d, (err, doc) => {
      if (err) {
        console.error(err);
      }
      cb(null, doc);
    });
  };
}

export { repoDbStream };
