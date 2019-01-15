const fs = require('fs')
  , path = require('path')
  , ejs = require('ejs')
  , Reporter = require('../../../lib/reporter');

/**
 * Read repo.db file and create README.txt file
 * @returns {Promise<void|Error>}
 * @param {*} options 
 */
function report(options) {
  const resolve = Reporter.resolve(options)
  const template = resolve('readme')
  const filename = path.join(options.cwd, "README.txt");
  const localRepo = options.localRepo;
  return new Promise( (resolve, reject) => {

    options.repoDb.find({}, (err, docs) => {

      if (err) {
        return reject(err)
      }

      const data = { ..._getCounter(docs), localRepo }

      ejs.renderFile(template, data, {}, function(err, str) {
        if (err) {
          return reject(err);
        }
        if (options.verbose) {
          console.log(str);
        }
        fs.writeFile(filename, str, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      })
    });
  })
}


function _getCounter(docs) {

  const prodDependencies = docs.reduce( (acc, d) => !!d.prod ? ++acc: acc, 0);
  const devDependencies = docs.reduce( (acc, d) => !d.prod ? ++acc: acc, 0);
  return { 
      totalCount: docs.length
    , prodDependencies
    , devDependencies };
}

module.exports = { report }
