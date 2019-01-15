const { copyFile, pathExists } = require('fs-extra') ;

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

module.exports = { copyInput }
