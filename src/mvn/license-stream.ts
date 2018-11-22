import { StreamOptions } from './stream-options';
import { Dependency } from './dependency';

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

function _getLicenses(pom: any) {
  const licenses: any = [];

  if (_hasLicenseNode(pom)) {
    const test = pom.project.licenses.license;
    // console.log(test)

    if (_isArray(test)) {
      for (const item  of test) {
        licenses.push(item);
      }
    } else if (typeof(test) === 'object') {
      licenses.push(test);
    }
  }
  return licenses;
}

function licenseStream(options: StreamOptions) {

  return (dependency: Dependency, cb: (err?: Error, dependency?: Dependency) => void) => {
    const pom = dependency.pom;
    const licenses = _getLicenses(pom);
    const licenseNames = licenses.map( (l) => (l.name || '').trim() );
    dependency.bestLicense.name = licenseNames.join(' OR ');

    cb(null, dependency);
  };
}

export { licenseStream };
