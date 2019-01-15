const { green, cyan, red } = require('chalk');
const { isArray } = require('../../../lib/utils');

/**
 * @returns  {(dependency:*, dependencyCallback: {(err:*, logline:string) => void}) => void}
 * @param {*} options
 */
function logStream(options = null) {
  let count = 0;
  let licenseCount = 0

  return (dependency, cb) => {

    let metadata = null;
    let licenseUrl = '-/-';
    let c = red;
    if (isArray(dependency.package) && dependency.package.length > 0) {
      metadata = dependency.package[0].metadata
      if (metadata.licenseUrl) {
        c = green;
        licenseUrl = metadata.licenseUrl;
        licenseCount++;
      } 
    }
    const fullName = cyan(dependency.fullname);
    const licenseBadge = c(`[${licenseUrl}]`);

    cb(null, `(${++count}|${green(licenseCount.toString())}): ${fullName} ${licenseBadge}\n`);
  }
}

module.exports = { logStream }
