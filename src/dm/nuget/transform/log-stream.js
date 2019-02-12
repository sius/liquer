const { green, cyan, red } = require('chalk');
const opath = require('object-path');

/**
 * @returns  {(dependency:*, dependencyCallback: {(err:*, logline:string) => void}) => void}
 * @param {*} options
 */
function logStream(options = null) {
  let count = 0;
  let licenseCount = 0

  return (dependency, cb) => {

    let c = red;
    let licenseUrl = '-/-';
    
    const metadata = opath.get(dependency, 'package.metadata')
    if (metadata) {
      c = green;
      licenseCount++;
      license = metadata.licenseUrl || metadata.copyright;
    }
    const licenseBadge = c(`[${license}]`);
    const fullName = cyan(dependency.fullname);
    
    cb(null, `(${++count}|${green(licenseCount.toString())}): ${fullName} ${licenseBadge}\n`);
  }
}

module.exports = { logStream }
