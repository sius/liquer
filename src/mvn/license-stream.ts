import { StreamOptions } from './stream-options';
import { Dependency } from './dependency';
import { License } from './license';
import { licenseLogStream } from './log-stream';
import { GAV } from './gav';

function _isArray(a: any): boolean {
  return (!!a) && (a.constructor === Array);
}

function _hasLicenseNode(pom: any) {
  return (pom
    && pom.project
    && pom.project.licenses
    && pom.project.licenses.license);
}

function _hasParent(pom: any) {
  return (pom
    && pom.project
    && pom.project.parent);
}

function _findLicense(options: StreamOptions, d: Dependency, cb: (license: License) => void) {
  let license: License;
  const pom = d.pom;
  if (_hasLicenseNode(pom)) {
    const test = pom.project.licenses.license;

    if (_isArray(test)) {
      const licenseNames = test.map( (l) => (l.name || '').trim() );
      license = { ...d.bestLicense, name: licenseNames };
    } else if (typeof(test) === 'object') {
      license = { ...d.bestLicense, name: test.name };
    }
    cb(license);
  } else if (_hasParent(pom)) {
    const parentGAV: GAV = {
        groupId: pom.project.parent.groupId
      , artifactId: pom.project.parent.artifactId
      , version: pom.project.parent.version
    };
    console.log(parentGAV);
    options.repoDb.findOne(parentGAV, (err: Error, parent: Dependency) => {
      if (err) {
        options.log.write(err.message);
      }
      if (parent) {
        _findLicense(options, parent, cb);
      } else {
        cb(null);
      }
    });
  } else {
    cb(null);
  }
}

function licenseStream(options: StreamOptions) {

  return (dependency: Dependency, cb: (err?: Error, dependency?: Dependency) => void) => {
    _findLicense(options, dependency, (license) => {
      if (license) {
        dependency.bestLicense.name = license.name;
        if (!dependency.bestLicense.url) {
          dependency.bestLicense.url = license.url;
        }
      }
      cb(null, dependency);
    });
  };
}

export { licenseStream };
