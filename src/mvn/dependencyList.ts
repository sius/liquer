import { spawn } from 'child_process';
import { split, map } from 'event-stream';
import { magenta } from 'colors';
import { StreamOptions } from './stream-options';
import { GATVS } from './gatvs';
import { mvn } from '../lib/utils';
const PATTERN  = /\[INFO\]\s{4}([^:]+):([^:]+):([^:]+):([^:]+):(compile|runtime|test)$/;

/**
 * Retrieve runtime dependencies from Maven
 * mvn -f pom.xml -Dmaven.repo.local=<localRepo> -DincludeScopes=runtime dependencyList
 * @param opts
 * @param callback
 */
function dependencyList(opts: StreamOptions, callback: (data: GATVS) => void) {
  spawn(mvn, [
      '-s', opts.settings
    , '-f', opts.destPom
    , `-Dmaven.repo.local=${opts.localRepo}`
    , `-DincludeScope=runtime`
    , 'dependency:list'])
    .stdout
      .pipe(split())
      .pipe(map( (line: string, cb: () => void) => {
        const res = PATTERN.exec(line);
        if (res) {
          callback( {
              groupId: res[1]
            , artifactId: res[2]
            , type: res[3]
            , version: res[4]
            , scope: res[5] });
          cb();
        } else {
          cb();
        }
      }))
      .on('end', () => process.exit(0));
}

process.on('message', (opts: StreamOptions) => {
  console.log(magenta(`fork process: mvn -DincludeScope=runtime dependencylist`));
  dependencyList(opts, (data: GATVS) => {
    process.send(data);
  });
});
