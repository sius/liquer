import { StreamOptions } from './stream-options';
import { MavenDependency } from './maven-dependency';
import { red, green, blue, cyan, magenta, yellow, grey } from 'colors';

function logStream(options: StreamOptions) {
  let count = 0;
  let licenseCount = 0;

  return (d: MavenDependency, cb: (err?: Error, line?: string) => void) => {

    const c = cyan;
    const gav = `${c(d.gav.groupId)}:${c(d.gav.artifactId)}:${c(d.gav.version)}`;
    const licenseInfo = d.license.name || d.license.url || null;
    const licenseBadge = licenseInfo ? green(`[${licenseInfo}]`) : '';
    if (licenseInfo) {
      licenseCount++;
    }
    cb(null, `(${++count}|${green(licenseCount.toString())}): ${gav} ${licenseBadge}\n`);
  };
}

function licenseLogStream(options: StreamOptions) {

  return (d: MavenDependency, cb: (err?: Error, line?: string) => void) => {

    if (d.license.text) {
      cb(null, `${d.license.text}\n\n`);
    } else {
      cb();
    }
  };
}

export { logStream, licenseLogStream};
