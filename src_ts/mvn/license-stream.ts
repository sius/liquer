import { StreamOptions } from './stream-options';
import { MavenDependency } from './maven-dependency';
import { License } from './license';
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

function _findLicense(d: MavenDependency, options: StreamOptions, cb: (license: License) => void) {
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
    options.repoDb.findOne({ gav: parentGAV }, (err: Error, parent: MavenDependency) => {
      if (err) {
        options.log.write(err.message);
      }
      if (parent) {
        if (parent.bestLicense.name || parent.bestLicense.url) {
          cb({ ...parent.bestLicense });
        } else {
          _findLicense(parent, options, cb);
        }
      } else {
        cb(null);
      }
    });
  } else {
    cb(null);
  }
}

function licenseStream(options: StreamOptions) {

  return (dependency: MavenDependency, cb: (err?: Error, dependency?: MavenDependency) => void) => {
    _findLicense(dependency, options, (license) => {
      if (license) {
        if (!dependency.bestLicense.name) {
          dependency.bestLicense.name = license.name;
        }
        if (!dependency.bestLicense.url) {
          dependency.bestLicense.url = license.url;
        }
      }
      cb(null, dependency);
    });
  };
}

export { licenseStream };
