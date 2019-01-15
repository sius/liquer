import { StreamOptions } from './stream-options';
import { MavenDependency } from './maven-dependency';

function repoDbStream(options: StreamOptions) {

  return (d: MavenDependency, cb: (err?: Error, d?: MavenDependency) => void) => {
    options.repoDb.update({ _id: d._id }, d, { upsert: true, returnUpdatedDocs: true } as Nedb.UpdateOptions, (err: Error, n: number, doc, upsert) => {
      if (err) {
        options.log.write(err.message);
      }
      cb(null, doc);
    });
  };
}

export { repoDbStream };
