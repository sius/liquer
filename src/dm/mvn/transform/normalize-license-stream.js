
const { resolve } = require('path')
  , Datasource  = require('nedb')
  , licenseDb = new Datasource({ filename: resolve(__dirname, '../../../db/license.db'), autoload: true })
/**
 * Return the normalized (spdx) license:
 * @returns { string[] }
 * @param {*} dependency 
 * @param {*} options 
 * @param {*} callback 
 */
function _normalize(license, options, callback) {
  let ret = { spdx: null, use: 0 };
  const cond = [];
  if (license && license.names && license.names.length > 0) {
    cond.push({ name: { $in: license.names } });
  }
  if (license.url) {
    cond.push({ url: { $elemMatch: license.url } });
  }
  if (cond.length > 0) {
    licenseDb.find( { $or: cond }, (err, dbItems) => {
      if (err) {
        options.log.write(`${err}\n`);
      }

      if (dbItems) {
        ret = dbItems.reduce( (acc, item) => 
            (item.use && item.use >= ret.use) ? item : acc
          , ret);
      }
      callback(ret)
    });
  } else {
    callback(ret)
  }
}

/**
 * Append spdxLicenses to the dpendency.license object
 * @returns  {(dependency:*, dependencyCallback: {(err:*, updatedDependency:*) => void}) => void}
 * @param {*} options 
 */
function normalizeLicenseStream(options) {
  let c = 0;
  return (dependency, cb) => {
    _normalize(dependency.license, options, (spdxLicense) => {
      dependency.license.spdx = spdxLicense.spdx;
      dependency.license.use = spdxLicense.use;
      cb(null, dependency);
    })
  }
}

module.exports = { normalizeLicenseStream }
