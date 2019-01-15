const { green, cyan } = require('chalk');

/**
 * @returns  {(dependency:*, dependencyCallback: {(err:*, logline:string) => void}) => void}
 * @param {*} options
 */
function logStream(options = null) {
  let count = 0;
  let licenseCount = 0

  return (dependency, cb) => {
    const fullName = cyan(dependency.fullname);
    let licenseName;
    if (dependency.license) {
      if (dependency.license.resolved) {
        licenseName = dependency.license.resolved.spdx;
        use = dependency.license.resolved.use;
      } 
    } 
    if (!licenseName) {
      licenseName = dependency.license.raw || '-/-';
    }

    const licenseBadge = green(`[${licenseName}]`);
    if (dependency.license && dependency.license.raw) {
      licenseCount++;
    }
    
    cb(null, `(${++count}|${green(licenseCount.toString())}): ${fullName} ${licenseBadge}\n`)
  }
}

module.exports = { logStream }
