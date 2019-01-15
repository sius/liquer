const path = require('path')
  , fs = require('fs')
  , utils = require('../../../lib/utils');

/**
 * 
 * @param {string} path 
 * @param {*} options 
 * @param {(err: Error, package: { package:*, license:string }) => void} cb 
 */
function _readPackageFiles(folderpath, options, cb) {
  const packagedir = path.join(options.cwd, folderpath);
  fs.exists(packagedir, (exists) => {

    if (exists) {

      fs.readdir(packagedir, (err, files) => {
        if (err) {
          return cb(err);
        }
        Promise.all(
          files
            .filter( (f) => f === 'package.json' || /^LICENSE/i.test(f))
            .map( (file) => {
              return new Promise( (resolve, reject) => {
                const filepath = path.join(packagedir, file);
                fs.readFile(filepath, 'utf8', (err, data) => {
                  if (err) {
                    return reject(err);
                  }
                  if (file === 'package.json') {
                    resolve({ package: JSON.parse(data, utils.keyNameReviver) })
                  } else {
                    resolve({ license: data, licensefile: file })
                  }
                });
              });
            }))
        .then( (values) => cb(null, Object.assign({}, ...values)))
        .catch(err => cb(err));
      });

    } else {
      cb(null, { package: null, license: null, licensefile: null })
    }
  })
  
}

/**
 * Handle invalid licenses property
 * @returns a simple string
 * @param {*} licenses 
 */
function _handleLicensesProperty(licenses) {
  if (utils.isArray(licenses) && licenses.length > 0) {
    if (licenses.length > 1) {
      return `(${licenses.map((obj) => _handleLicenseObject(obj)).join(' OR ')})`;
    } else {
      return _handleLicenseObject(licenses[0]);
    }
  } else {
    return _handleLicenseObject(licenses);
  }
}
/**
 * Handle invalid license metadata objects.
 * Drops any property except for 'type' or 'license' or retur stringified object
 * @returns a simple license string 
 * @param {*} obj 
 */
function _handleLicenseObject(obj) {

  /* if (obj && typeof(obj) === 'string') {
    return obj;
  } */
  const otype = obj.type
  if(otype && typeof(otype) === 'string') {
    return utils.trimQuotes(otype);
  }
  const olicense = obj.license || obj.licence;
  if (olicense && typeof(olicense) === 'string') {
    return utils.trimQuotes(olicense);
  }
  
  return utils.trimQuotes(JSON.stringify(obj));
}

/**
 * @returns a simple license string
 * @param {*} package 
 */
function _preLicenseManagement(package) {
  let ret = null;
  if (!package) {
    return ret;
  }
  const raw = package.license || package.licence;
  if (raw) {
    if (utils.isArray(raw)) {
      ret = _handleLicensesProperty(raw);
    } else {
      ret = _handleLicenseObject(raw);
    } 
  }
 
  if (!ret || ret === '') {
    if (package.licenses) {
      ret = _handleLicensesProperty(package.licenses);
    }
  }
  return ret;
}

/**
 * Transforms the maven log lines into a stream object (the dependency)
 * @returns  {(line:string, dependencyCallback: {(err:*, dependency:*) => void}) => void}
 * @param {*} options 
 */
function dependencyStream(options) {
  const log = options.log;
  const pkg_type = 'npm';

  return (line, cb) => {
    
    log.write(`${line}\n`);
    const res = /~postinstall:\s+(((@[^:@]+)\/)?([^:@]+)@([^:@]+))$/i.exec(line);
    if (res) {
      const fullname = res[1];
      const component_id = fullname;
      const component_scheme = 'npm://';
      const parentdir = res[2] || '';
      const scope = res[3] || null;
      const name = res[4];
      const version = res[5];
      const path = `node_modules/${parentdir}${name}`;

      _readPackageFiles(path, options, (err, filedata) => {
        
        if (err) {
          return cb(err)
        }
        const package = filedata.package;
        if (!package) {
          return cb();
        }
        const text = filedata.license;
        const file = filedata.licensefile;
        const raw = _preLicenseManagement(package)
        const resolved = null;
        const license =  { raw, text, file, resolved}
        const dependency = {
          pkg_type, component_id, component_scheme, fullname, scope, name, version, path, license, package
        }
        cb(null, dependency);
      })
    } else {
      cb();
    }
  }
}

module.exports = { dependencyStream };
