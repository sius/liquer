import { StreamOptions } from './stream-options';
import { GAV } from './gav';
import { Dependency } from './dependency';
import { join } from 'path';

/**
 *
 * @param options
 */
function dependencyStream(options: StreamOptions): (line: string, cb: (err: Error, data: any) => void) => void {

  const downloadedPattern = new RegExp(`Downloaded\.*: (${options.remoteRepo}/(.+\.(pom|jar|war|ear|rar|zip)))`);
  const errorPattern = /\[Error\]:\s*(.+)/i;

  return (line: string, cb: (err?: Error, data?: Dependency) => void) => {

    const matches = downloadedPattern.exec(line);
    if (matches) {
      const downloaded = matches[1];
      const filepath   = matches[2];
      const type   = matches[3];
      const parts      = filepath.split('/');
      const filename   = parts.pop();
      const version    = parts.pop();
      const artifactId = parts.pop();
      const groupId    = parts.join('.');
      const pomfile    = join(options.localRepo, filepath.replace(filename, `${artifactId}-${version}.pom`));
      const gav: GAV   = { groupId, artifactId, version };
      const dep: Dependency = {
        downloaded,
        gav,
        type,
        pomfile,
        pom: null,
        bestLicense: null,
        vulnarabilites: null
      };
      cb(null, dep);
    } else {
      const err = errorPattern.exec(line);
      if (err) {
        // options.log.write(err[0]);
      }
      cb();
    }
  };
}

export { dependencyStream };
