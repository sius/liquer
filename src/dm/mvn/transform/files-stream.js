const { readFile, readdir } = require('fs')
  , { getFullName } = require('../badges')
  , { objFromXmlFile } = require('../../../lib/utils')
  , path = require('path');

function _grabFirstComment(xmlStr) {
  let ret = null;
  if (!xmlStr) {
    return xmlStr;
  }
  let c0 = xmlStr.indexOf('<!--');
  if (c0 > -1) {
    let c1 = xmlStr.indexOf('-->');
    if (c1 > c0) {
      ret = xmlStr.substring(c0 + 4, c1-1);
    }
  }
  return ret;
}

function _getLicenseUrl(text) {
  if (text) {
    const p0 = text.indexOf('License');
    if (p0 > -1) {
      const matches = /(https?:\/\/[^\s<>]+)[\b]?/gim.exec(text.substring(p0))
      if (!!matches) {
        return matches[1]
      }
    }
  }
  return null;
}

function _fileEndsWith(dirname, files, dotExt) {
  if (!!files) {
    const lowerDotExt = (dotExt || '').toLowerCase();
    const file = files.find( f => (f||'').endsWith(lowerDotExt))
    if (!!file) {
      return path.join(dirname, file);
    }
  }
  return null;
}

function _ftostr(filename, options, cb) {
  if (filename) {
    readFile(filename, { encoding: 'utf8', flag: 'r' }, (err, data) => {
      if (err) {
        options.log.write(`${err}\n`);
      }
      cb(data);
    })
  } else {
    cb(null);
  }
}

/**
 * 
 * @param {*} dependency 
 * @param {*} options 
 * @param { (err:Error, dependency:*) => void } cb 
 */
function _getFiles(dependency, options, cb) {
  const dirname = dependency.dirname;

  readdir(dirname, (err, files) => {
    
    const pomfile = _fileEndsWith(dirname, files, '.pom');
    const pomSha1File = _fileEndsWith(dirname, files, '.pom.sha1');
    const jarfile = _fileEndsWith(dirname, files, '.jar');
    const jarSha1File = _fileEndsWith(dirname, files, '.jar.sha1');

    dependency.files = files;
    dependency.hasPomFile = (!!pomfile);
    dependency.hasJarFile = (!!jarfile);
    dependency.license = { names: [], title: null, comment: null, url: null };

    _ftostr(pomSha1File, options, (sha1) => {
      dependency.pomSha1 = sha1;

      _ftostr(jarSha1File, options, (sha1) => {
        dependency.jarSha1 = sha1;

        if (dependency.pom) {
          cb(err, dependency);
        } else {
          if (dependency.hasPomFile) {

            objFromXmlFile(pomfile, (err, pomStr, pomObj) => {
   
              const names = []
              , title = null
              , text = _grabFirstComment(pomStr)
              , url = _getLicenseUrl(text)
              , license = { names, title, text, url }
          
              dependency.license = license;
              dependency.pom = pomObj;

              cb(err, dependency)
            });
          } else {
            cb(err, dependency)
          }
        }
      }) 
    }) 
  });
}

/**
 * Append the artifact pom.xml info to the streamed dependency object
 * and retrieve downloaded files
 * @returns  {(dependency:*, dependencyCallback: {(err:*, dependency:*) => void}) => void}
 * @param {*} options 
 */
function filesStream(options) {
  
  return (dependency, cb) => {
    _getFiles(dependency, options, (err, dependency) => {
      if (err) {
        options.log.write(`${err}\n`)
      }
      dependency.fullname = getFullName(dependency);
      cb(null, dependency)
    })
  }
}

module.exports = { filesStream }
