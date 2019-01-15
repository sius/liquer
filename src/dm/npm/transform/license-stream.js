const { resolve } = require('path')
  , Datasource = require('nedb')
  , licenseDb = new Datasource({ filename: resolve(__dirname, '../../../db/license.db'), autoload: true });

/**
 * Resolve SPDX license from license.db
 * @param {*} pom 
 * @param {*} callback 
 */
function _resolveSPDXLicense(options, rawLicense, callback) {
  licenseDb.findOne({ name: rawLicense }, (err, doc) => {
    if (err) {
      options.log(JSON.stringify(err, null, 2));
    }
    callback(doc);
  })

}

/**
 * Append license info to the stream object
 * @returns  {(dependency:*, dependencyCallback: {(err:*, updatedDependency:*) => void}) => void}
 * @param {*} options 
 */
function licenseStream(options) {
  return (dependency, cb) => {
    _resolveSPDXLicense(options, dependency.license.raw, (resolvedLicense) => {
      dependency.license.resolved = resolvedLicense;
      cb(null, dependency)
    })
  }
}

module.exports = { licenseStream }
