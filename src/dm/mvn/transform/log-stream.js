const { green }  = require('chalk')
  , { getFullNameBadge } = require('../badges')
  , badges = require('../../../lib/badges')

/**
 * @returns  {(dependency:*, dependencyCallback: {(err:*, logline:string) => void}) => void}
 * @param {*} options
 */
function logStream(options) {
  let count = 0;
  let licenseCount = 0

  return (dependency, cb) => {
   
    const fullnameBadge = getFullNameBadge(dependency);
    const l = dependency.license;
    const licenseInfo = l.spdx || l.joinedNames || l.url || null;  
    const licenseBadge = `[${green(licenseInfo)}]`
    if (licenseInfo) {
      licenseCount++;
    }
    cb(null, `(${++count}|${green(licenseCount.toString())}): ${fullnameBadge} ${licenseBadge}\n`)
  }
}

module.exports = { logStream }
