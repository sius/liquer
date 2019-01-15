import { spawn } from 'child_process';
import { split, map, readArray } from 'event-stream';
import { MAVEN_OPTIONS, AuditOptions } from './audit-options';
import { ResolvedOptions } from './resolved-options';
import { dependencyStream } from './dependency-stream';
import { pomStream } from './pom-stream';
import { extFilesStream } from './ext-files-stream';
import { licenseStream } from './license-stream';
import { logStream } from './log-stream';
import { repoDbStream } from './repodb-stream';
import { MavenDependency } from './maven-dependency';
import { report } from './report';
<<<<<<< HEAD:src_ts/mvn/audit.ts
import { mvn } from './utils';
=======
import { green, underline } from 'colors';

import { mvn } from '../lib/utils';
>>>>>>> 87bea83ba5845180e61ad95833fb3038b8f4c0bc:src/mvn/audit.ts
import { updateScope } from './updateScope';
function _runGoal(options: AuditOptions) {

  new ResolvedOptions(options, (err, opts) => {
    if (err) {
      return process.exit(-1);
    }

    spawn(mvn, opts.args)
      .stdout
      .on('end', () => {
        opts.repoDb.find({ }, (_err: Error, docs: MavenDependency[]) => {

          if (_err) {
            opts.log.write(_err.message);
          }
          console.log(`Updating ${docs.length} dependencies`);
          readArray(docs)
            .pipe(map(licenseStream(opts)))
            .pipe(map(repoDbStream(opts)))
            .pipe(map(logStream(opts)))
            .on('end', () => {
              updateScope(opts, (opts2) => {
                opts.repoDb.persistence.compactDatafile();
                (opts.repoDb as any).on('compaction.done', () => {
                  report(opts, () => {
                    opts.log.close();
                    process.exit(0);
                  });
                });
              });
            })
            .pipe(process.stdout);
        });
      })
      .pipe(split())
      .pipe(map(dependencyStream(opts)))
      .pipe(map(pomStream(opts)))
      .pipe(map(extFilesStream(opts)))
      .pipe(map(licenseStream(opts)))
      .pipe(map(repoDbStream(opts)))
      .pipe(map(logStream(opts)))
      .pipe(process.stdout);
  });
}

export function audit(options?: AuditOptions) {
  _runGoal({ ...MAVEN_OPTIONS, ...options });
}
