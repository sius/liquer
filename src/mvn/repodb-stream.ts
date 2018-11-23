import { StreamOptions } from './stream-options';
import { Dependency } from './dependency';

function repoDbStream(options: StreamOptions) {

  return (d: Dependency, cb: (err?: Error, d?: Dependency) => void) => {
    options.repoDb.update({ _id: d._id }, d, { upsert: true, returnUpdatedDocs: true } as Nedb.UpdateOptions, (err: Error, docs: any, upsert) => {
      if (err) {
        console.error(err);
      }
      if (docs.length > 0) {
        cb(null, docs[0]);
      } else {
        cb();
      }
    });
  };
}

export { repoDbStream };
