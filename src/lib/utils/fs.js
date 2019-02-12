const { copyFile, pathExists, statSync } = require('fs-extra');
const path = require('path');

function isDir(source) {
  return statSync(source).isDirectory();
}
/**
 * 
 * @param {string} src 
 * @param {string} dest 
 * @param {boolean} optional 
 */
function copyInput(src, dest, optional = false) {
  pathExists(src, (_err, exists) => {
    if (exists || optional) {
      copyFile(src, dest, (err2) => {
        if (err2) {
          console.error(JSON.stringify(err2, null, 2))
          return process.exit(-1);
        }
      })
    }
    else {
      console.error('Could not find file: ', src, '.');
    }
  });
}

/**
 * 
 * @param {*} files 
 * @param {*} folder 
 * @param { {err: Error, CopyInfo: { srcFiles:Array<String>, destFiles: Array<String> }}} copyInfoCallback 
 */
function copyFilesToDir(files, dir, copyInfoCallback) {

  Promise.all(files.map((f) => {
    return new Promise( (resolve, reject) => {
      path.relative(f, )
    });
  }))
  .then( (values) => {
    const copyInfo = {
        srcFiles: files
      , destFiles: values
    }
    copyInfoCallback
  })
  .catch( (reason) => copyInfoCallback(reason));
}
module.exports = { copyInput, isDir }
