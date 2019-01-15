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
    cb(null, `(${++count}|${green(licenseCount.toString())}): ${fullName}\n`)
  }
}

module.exports = { logStream }
