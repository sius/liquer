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

function _findLicense(d: Dependency, options: StreamOptions, cb: (license: License) => void) {
  let license: License = d.bestLicense;
  const pom = d.pom;
  if (_hasLicenseNode(pom)) {
    const test = pom.project.licenses.license;

    if (_isArray(test)) {
      const licenseNames = test.map( (l) => (l.name || '').trim() );
      license = { ...d.bestLicense, name: licenseNames };
    } else if (typeof(test) === 'object') {
      license = { ...d.bestLicense, name: test.name };
    } else {
      license = d.bestLicense;
    }
    cb(license);
  } else if (_hasParent(pom)) {
    const parentGAV: GAV = {
        groupId: pom.project.parent.groupId
      , artifactId: pom.project.parent.artifactId
      , version: pom.project.parent.version
    };
    options.repoDb.findOne(parentGAV, (err: Error, parent: Dependency) => {
      if (err) {
        options.log.write(err.message);
      }
      if (parent) {
        _findLicense(parent, options, cb);
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
    _findLicense(dependency, options, (license) => {
      if (license) {
        dependency.bestLicense.name = license.name;
        if (dependency.bestLicense.url === null) {
          dependency.bestLicense.url = license.url;
        }
      }
      cb(null, dependency);
    });
  };
}

export { licenseStream };
