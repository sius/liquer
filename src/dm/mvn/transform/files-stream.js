const { readFile, readdir } = require('fs')
  , { getFullName } = require('../badges')
  , path = require('path')
  , xml2js = require('xml2js')
  , pomParser = new xml2js.Parser({
      ignoreAttrs: true,
      explicitArray: false,
      tagNameProcessors: [(name) => name.replace(/\./g, '_')]
    }
  );

const BOM_NODE_BLACKLIST = ['dependencies'];
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

function _pom(pomfile, options, cb) {
  if (pomfile) {
    readFile(pomfile, { encoding: 'utf8', flag: 'r' } , (err, xml) => {
      if (err) {
        options.log.write(`${err}\n`)
      }
      if (xml) {
          pomParser.parseString(xml, (err2, pom) => {
          if (err2) {
            options.log.write(`${err2}\n`);
          }
          const names = []
            , title = null
            , text = _grabFirstComment(xml)
            , url = _getLicenseUrl(text)
            , license = { names, title, text, url }
          cb({ license, pom });
        })
      } else {
        cb(null);
      }
    });
  } else {
    cb(null);
  }
}
/**
 * Bill of Materials (BOM)
 * - no aggregation (Multi-module), build, reporting etc.
 * - only dependencyManagement (aka: the 'Bill of Materials')
 * @param {*} dependency
 */
function _detectBOM(dependency) {
  const pom = dependency.pom;
  if (pom.project) {
    const noJar = !dependency.hasJarFile
    const noJarPackaging = !('jar' === pom.project.packaging);
    const extNameIsPom = ('pom' === dependency.extname)
    const found = Object.keys(pom.project).find(attr => BOM_NODE_BLACKLIST.includes(attr));
    const nameHint = /-bom$/.test(dependency.gav.artifactId) || /-bom$/.test(pom.project.name);
    const dmHint = ( pom.project.dependencyManagement
      && pom.project.dependencyManagement.dependencies 
      && pom.project.dependencyManagement.dependencies.dependency);
    return (!found && (nameHint || dmHint) && noJar && noJarPackaging && extNameIsPom);
  }
  return false;
}

function _getFiles(dependency, options, cb) {
  const dirname = dependency.dirname;

  readdir(dirname, (err, files) => {
    if (err) {
      options.log.write(`${err}\n`)
    }
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
          dependency.isBOM = _detectBOM(dependency);
          cb(dependency);
        } else {
          dependency.isBOM = false;
          if (dependency.hasPomFile) {
            _pom(pomfile, options, (data) => {
              if (data) {
                dependency.license = data.license;
                dependency.pom = data.pom;
                dependency.isBOM = _detectBOM(dependency);
              }
              cb(dependency)
            });
          } else {
            cb(dependency)
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
    _getFiles(dependency, options, (dependency) => {
      dependency.fullname = getFullName(dependency);
      cb(null, dependency)
    })
  }
}

module.exports = { filesStream }
