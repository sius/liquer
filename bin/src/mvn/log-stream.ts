import { StreamOptions } from './stream-options';
import { Dependency } from './dependency';
import { red, green, blue, cyan, magenta, yellow, grey } from 'colors';

function logStream(options: StreamOptions) {
  let count = 0;
  let licenseCount = 0;

  return (d: Dependency, cb: (err?: Error, line?: string) => void) => {
    
    const c = cyan;
    const gav = `${c(d.gav.groupId)}:${c(d.gav.artifactId)}:${c(d.gav.version)}`;
    const licenseInfo = d.bestLicense.name || d.bestLicense.url || null;
    const licenseBadge = licenseInfo ? green(`[${licenseInfo}]`) : '';
    if(licenseInfo) {
      licenseCount++;
    }
    cb(null, `(${++count}|${green(licenseCount+'')}): ${gav} ${licenseBadge}\n`);
  };
}

function licenseLogStream(options: StreamOptions) {

  return (d: Dependency, cb: (err?: Error, line?: string) => void) => {
    
    if(d.bestLicense.text) {
      cb(null, `${d.bestLicense.text}\n\n`);
    } else {
      cb();
    }
    
  };
}

export { logStream, licenseLogStream};
