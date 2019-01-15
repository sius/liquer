const { isArray } = require('../../../lib/utils');

/**
 * @returns {boolean} true if pom has a license node
 * @param {*} pom 
 */
function _hasLicenseNode(pom) {
  return (pom 
    && pom.project 
    && pom.project.licenses 
    && pom.project.licenses.license);
}

/**
 * @returns {boolean} true if pom has a parent node
 * @param {*} pom 
 */
function _hasParentNode(pom) {
  return (pom
    && pom.project 
    && pom.project.parent);
}

/**
 * Collect license names and URLs from POM file
 * @returns {{ name:string, spdx:string, use:number }}
 * @param {*} dependency) 
 * @param {*} options 
 * @param {(license) => void} cb 
 */
function _findLicense(dependency, options, cb) {
  
  if (dependency.hasPomFile) {
    let license = { ...dependency.license };
    const pom = dependency.pom;

    if (_hasLicenseNode(pom)) {
      const test = pom.project.licenses.license;
  
      if (isArray(test)) {
        const licenseNames = test.map( (l) => (l.name || '').trim() );
        license = { ...dependency.license, names: licenseNames }
      } else if (typeof(test) === 'object') {
        license = { ...dependency.license, names: [test.name] };
      } else {
        license = dependency.license;
      }
      cb(license);
    } else if (_hasParentNode(pom)) {
      const parentGAV = {
          groupId: pom.project.parent.groupId
        , artifactId: pom.project.parent.artifactId
        , version: pom.project.parent.version
      }
      options.repoDb.findOne({ gav: parentGAV }, (err, parent) => {
        if (err) {
          options.log.write(`${err}\n`);
        }
        if (parent) {
          if ( (parent.license.names && parent.license.names.length > 0) || parent.license.url) {
            cb({ ...parent.license })
          } else {
            _findLicense(parent, options, cb);
          }
        } else {
          cb(null);
        }
      });
    } else {
      cb({ spdx: null});
    }
  } else {
    cb({ spdx: null});
  }
}

/**
 * Aggregate license and parent license infos
 * @returns  {(dependency:*, dependencyCallback: {(err:*, updatedDependency:*) => void}) => void}
 * @param {*} options 
 */
function licenseStream(options) {
  return (dependency, cb) => {

    _findLicense(dependency, options, (license) => {
      if (license && dependency.license) {
        if (!dependency.license.names || dependency.license.names.length === 0) {
          dependency.license.names = license.names;
        }
        dependency.license.joinedNames = 
          (dependency.license.names ? dependency.license.names.join(' OR ') : null);
          
        if (!dependency.license.url) {
          dependency.license.url = license.url;
        }
      }
      cb(null, dependency)
    })
  }
}

module.exports = { licenseStream };
