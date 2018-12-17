import { StreamOptions } from './stream-options';
import { GAV } from './gav';
import { MavenDependency } from './maven-dependency';
import * as path from 'path';

/**
 *
 * @param options
 */
function dependencyStream(options: StreamOptions): (line: string, cb: (err: Error, data: any) => void) => void {

  const downloadedPattern = new RegExp(`Downloaded\.*: (${options.remoteRepo}/(.+\.(pom|jar|war|ear|rar|zip)))`);
  const errorPattern = /\[Error\]:\s*(.+)/i;

  return (line: string, cb: (err?: Error, data?: MavenDependency) => void) => {

    const matches = downloadedPattern.exec(line);
    if (matches) {
      const tool = 'mvn';
      const downloaded = matches[1];
      const filepath   = matches[2];
      const extname    = matches[3];
      const parts      = filepath.split('/');
      const filename   = parts.pop();
      const version    = parts.pop();
      const artifactId = parts.pop();
      const groupId    = parts.join('.');
      const dirname    = path.join(options.localRepo, path.dirname(filepath));
      // const pomfile    =
      const gav: GAV   = { groupId, artifactId, version };
      const dep: MavenDependency = {
          tool
        , downloaded
        , gav
        , filename
        , extname
        , type: extname
        , dirname
        , pom: null
        , license: null
        , bestLicense: null
        , vulnarabilites: null
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
