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
import { green, underline } from 'colors';

function _runGoal(options: AuditOptions) {

  new ResolvedOptions(options, (err, opts) => {
    if (err) {
      return process.exit(-1);
    }

    spawn('mvn', opts.args)
      .stdout
      .on('end', () => {
        opts.repoDb.find({ }, (_err: Error, docs: MavenDependency[]) => {
          if (_err) {
            opts.log.write(_err.message);
          }
          console.log(`Update ${docs.length} license info(s)`);
          readArray(docs)
            .pipe(map(licenseStream(opts)))
            .pipe(map(repoDbStream(opts)))
            .pipe(map(logStream(opts)))
            .on('end', () => {
              opts.repoDb.persistence.compactDatafile();
              (opts.repoDb as any).on('compaction.done', () => {
                report(opts, () => {
                  opts.log.close();
                  console.log(`${green('( done )')}: ${underline(opts.reportPath)}`);

                  process.exit(0);
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
