import { spawn } from 'child_process';
import { split, map, stringify } from 'event-stream';
import { MAVEN_OPTIONS, MavenOptions } from './maven-options';
import { ResolvedOptions } from './resolved-options';
import { dependencyStream } from './dependency-stream';
import { pomStream } from './pom-stream';
import { licenseStream } from './license-stream';
import { logStream } from './log-stream';
import { repoDbStream } from './repodb-stream';

function _runGoal(options: MavenOptions) {
  new ResolvedOptions(options, (err, opts) => {
    if (err) {
      console.error(err.message);
      process.exit(-1);
      return;
    }
    spawn('mvn', opts.args)
      .stdout
      .on('end', () => { console.log('done'), process.exit(0); })
      .pipe(split())
      .pipe(map(dependencyStream(opts)))
      .pipe(map(pomStream(opts)))
      .pipe(map(licenseStream(opts)))
      .pipe(map(repoDbStream(opts)))
      .pipe(map(logStream(opts)))
      .pipe(process.stdout);
  });
}

export function audit(options?: MavenOptions) {
  _runGoal({ ...MAVEN_OPTIONS, ...options, file: 'pom.xml' });
}

audit();
