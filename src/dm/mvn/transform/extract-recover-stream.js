const { devnull } = require('../../../lib/utils')
  , { getFullName } = require('../badges')
  , fse = require('fs-extra')
  , fs = require('fs')
  , yauzl = require('yauzl')
  , path = require('path')
  , EXTRACTED_FILES_PATTERN = /(LICENSE)/i;

/**
 * @returns {void}
 * @param {Array<string>} files 
 * @param {*} options 
 * @param { { err:*, contentCallback: Array<{ file:string, content:string }>} } callback 
 */
function _readcontent(files, options, callback) {
  const localRepo = options.localRepo;
   Promise.all(files.map( (file) => {
    return new Promise( (resolve, reject) => {
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) { return reject(err); }
        resolve({ file: path.relative(localRepo, file), data });
      })
    })
  }))
  .then( (content) => callback(null, content) )
  .catch( (err) => callback(err) )
}
/**
 * Prefix basename with gav coordinates
 * @returns {string} prefixed basename
 * @param { {groupId:string, artifactId:string, versionId:string} } gav 
 * @param {string} file 
 */
function _getGAVPrefixedFile(gav, file) {
  return `${gav.groupId}_${gav.artifactId}_${gav.version}_${path.basename(file)}`;
}
/**
 * Move the extracted Files:
 * @returns {void}
 * @param {dependency:*} folderpath
 * @param {string} folderpath
 * @param {*} options 
 * @param {(err:*, movedTxtFiles:string[])=>void} callback 
 */
function _mvfiles(dependency, files, options, callback) {
  const gav = dependency.gav;
  const extractedPath = options.extractedPath;
  Promise.all(files.map((file) => {
      const extfile = path.join(extractedPath, _getGAVPrefixedFile(gav, file));
      return new Promise( (resolve, reject) => {
        fs.copyFile(file, extfile, (err) => {
          if (err) { 
            return reject(err); 
          }
          resolve(extfile);
        })
      })
    })
  )
  .then( (moved) => callback(null, moved) )
  .catch( (err) => callback(err) )
}

/**
 * Unzip and extract license files
 * @param {*} dependency 
 * @param {*} options 
 * @param {(error:*, files:Array<{extracted:string[], moved:string[]}>) => void} extractedTextFilesCallback 
 */
function _extract(dependency, options, extractedTextFilesCallback) {
  const dirname = dependency.dirname;
  Promise.all(
    dependency.files
      .filter( (file) => /\.(jar|zip|rar|war|ear)/i.test(file))
      .map( (file) => {
        const extracted = [];
        
        return new Promise( (resolve, reject) => {
          const filepath = path.join(dirname, file);
          const folderpath = filepath.slice(0, -4);
          yauzl.open(filepath, { lazyEntries: true }, (err, zipfile) => {
            if (err) {
              reject(err);
            } else {
              zipfile.readEntry();
              zipfile.on('entry', (entry) => {
                if(/\/$/.test(entry.fileName)) {
                  zipfile.readEntry();
                } else {
                  zipfile.openReadStream(entry, (err2, readStream) => {
                    if (err2) { 
                      reject(err2); 
                    }
                    
                    readStream.on('end', () => {
                      zipfile.readEntry();
                    })
                    if (EXTRACTED_FILES_PATTERN.test(entry.fileName)) {
                      const destFile = path.join(folderpath, entry.fileName);
                      extracted.push(destFile);
                      fse.ensureDir(path.parse(destFile).dir, (err3) => {
                        if (err3) { 
                          reject(err3); 
                        }
                        readStream.pipe(fs.createWriteStream(destFile));
                      })
                    } else {
                      readStream.pipe(devnull());
                    }
                  })
                }
              })
              .on('error', (err) => reject(err))
              .on('close', (err) => {
                if (err) { 
                  return reject(err);
                }
                _mvfiles(dependency, extracted, options, (err, _moved) => {
                  if (err) { 
                    return reject(err); 
                  }
                  _readcontent(extracted, options, (err, content) => {
                    if (err) { 
                      return reject(err); 
                    }
                    resolve({ content });
                  })  
                });
              })
            }
          })
        })
      })
  )
  .then( (value) => extractedTextFilesCallback(null, value ) )
  .catch( (err) => extractedTextFilesCallback(err) )
}

/**
 * Recover missing pom record data from jar dependency record
 * @param {*} pomDependency 
 * @param {*} options 
 * @param { (recoveredPomDependency:*) => void} callback 
 */
function _recover(pomDependency, options, callback) {
  const type = 'jar'
  const gav = { ...pomDependency.gav };
  options.repoDb.findOne({ gav, type }, (err, jarDependency) => {
    if (err) {
      options.log.write(err.message);
      pomDependency.extractedFiles = [];
    } else {
      if (jarDependency) {
        pomDependency.files = jarDependency.files;
        pomDependency.hasJarFile = true;
        pomDependency.pomSha1 = jarDependency.pomSha1;
        pomDependency.jarSha1 = jarDependency.jarSha1;
        pomDependency.extractedFiles = jarDependency.extractedFiles || [];
        pomDependency.xray = pomDependency.xray;
      } else {
        pomDependency.extractedFiles = [];
      }
      pomDependency.fullname = getFullName(pomDependency);
    }
    callback(pomDependency);
  });
}
/**
 * Extract files or recover missing dependency informations
 * @returns  {(dependency:*, dependencyCallback: {(err:*, dependency:*) => void}) => void}
 * @param {*} options 
 */
function extractRecoverStream(options) {
  return (dependency, cb) => {
    if (!options.extractFiles || !dependency.hasJarFile  || !!dependency.extractedFiles) {
      cb(null, dependency);
    } else {
      if (dependency.type === 'pom') {
        _recover(dependency, options, (recoveredDependency) => {
          cb(null, recoveredDependency);
        })
      } else {
        _extract(dependency, options, (err, files) => {
          if (err) { 
            options.log.write(err.message);
            dependency.extractedFiles = [];
          } else {
            dependency.extractedFiles = files;
          }
          cb(null, dependency);
        })
      }
    }
  }
}

module.exports = { extractRecoverStream };
