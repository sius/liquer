const path = require('path')
  , fs = require('fs')
  , chalk = require('chalk')
  , utils = require('../../../lib/utils');

function _isDir(source) {
  return fs.statSync(source).isDirectory();
}
/**
 * 
 * @param {string} componentPath 
 * @param {*} resolvedComponentPathCallback 
 */
function _resolveComponentPath(componentPath, resolvedComponentPathCallback) {
  fs.exists(componentPath, (exists) => {
    if (exists) {
      resolvedComponentPathCallback(null, path.basename(componentPath));
    } else {
      let sanitizedPath = componentPath;
      while (sanitizedPath.endsWith('.0')) {
        const len = sanitizedPath.length;
        if (len <= 3) {
          return resolvedComponentPathCallback(new Error(`Invalid path: ${componentPath}`));
        }
        sanitizedPath = sanitizedPath.substring(0, sanitizedPath.length-2)
      }
      const dirname = path.dirname(componentPath);
      fs.readdir(dirname, (err, files) => {
        if (err) {
          return resolvedComponentPathCallback(err);
        }
  
        const resolvedComponentPath = files.find( (file) => new RegExp(path.basename(sanitizedPath), 'iy').test(file) && _isDir(path.resolve(dirname,file)) );
 
        if (resolvedComponentPath) {
          resolvedComponentPathCallback(null, resolvedComponentPath);
        } else {
          resolvedComponentPathCallback(new Error(`Invalid path: ${componentPath}`));
        }
      });
    }
  })
}

/**
 * Transforms the nuget log line stream into an object stream (the dependency)
 * @returns  {(line:string, dependencyCallback: {(err:*, dependency:*) => void}) => void}
 * @param {*} options 
 */
function dependencyStream(options) {
  const log = options.log;
  const pkg_type = 'nuget';

  return (line, cb) => {
    
    log.write(`${line}\n`);
    const res = /Added package '(.+)' to folder/.exec(line)
    if (res) {
      const component_id = res[1];
      const component_scheme = 'nuget://';
      const componentPath = path.resolve(options.localRepoDir, component_id);
      _resolveComponentPath(componentPath, (err, component_path) => {
        if (err) {
          options.log.write(`[ERROR] ${err.message}\n`)
        }
        const fullname = component_path;
        const dependency = {
          pkg_type, component_id, component_scheme, component_path, fullname
        }
        cb(null, dependency);
      });
    } else {
      cb();
    }
  }
}

module.exports = { dependencyStream };
