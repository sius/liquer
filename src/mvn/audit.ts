import { spawn } from 'child_process';
import { split, map, stringify } from 'event-stream';
import { MAVEN_OPTIONS, MavenOptions } from './maven-options';
import { ResolvedOptions } from './resolved-options';
import { dependencyStream } from './dependency-stream';
import { pomStream } from './pom-stream';
import { logStream } from './logStream';
import { licenseStream } from './license-stream';

function _runGoal(options: MavenOptions) {
  const opts = new ResolvedOptions(options);
  spawn('mvn', opts.args)
    .stdout
    .pipe(split())
    .pipe(map(dependencyStream(opts)))
    .pipe(map(pomStream(opts)))
    .pipe(map(licenseStream(opts)))
    .pipe(map(logStream(opts)))
    .pipe(process.stdout);
}

export function audit(options?: MavenOptions) {
  _runGoal({ ...MAVEN_OPTIONS, ...options });
}

audit();
