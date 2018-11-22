import { spawn } from 'child_process';
import { split, map, stringify } from 'event-stream';
import { MAVEN_OPTIONS, MavenOptions } from './maven-options';
import { ResolvedOptions } from './resolved-options';
import { dependencyStream } from './dependency-stream';
import { pomStream } from './pom-stream';
import { licenseStream } from './license-stream';
import { logStream } from './log-stream';
import { createWriteStream } from 'fs-extra';



function _runGoal(options: MavenOptions) {
  const opts = new ResolvedOptions(options);
  spawn('mvn', opts.args)
    .stdout
    .on('end', () => { console.log('done'), process.exit(0) })
    .pipe(split())
    .pipe(map(dependencyStream(opts)))
    .pipe(map(pomStream(opts)))
    .pipe(map(licenseStream(opts)))
    .pipe(map(logStream(opts)))
    .pipe(process.stdout);
    .pipe(createWriteStream(resolve(__dirname, 'licenses.txt'), { flags: 'a+'}));
}

export function audit(options?: MavenOptions) {
  _runGoal({ ...MAVEN_OPTIONS, ...options });
}

audit();
