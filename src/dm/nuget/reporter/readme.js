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

/**
 * @returns { {metadata:Array<*>} }
 * @param {*} d 
 */
function _getCounter(docs) {

  let totalCount = 0;
  let prodDependencies = 0;
  let devDependencies = 0;

  docs.forEach( (d) => {

    const metas = d.package.map( (p) => p.metadata);
    metas.forEach( (meta) => {
      totalCount++;
      if (meta.developmentDependency === "true") {
        devDependencies++;
      } else {
        prodDependencies++;
      }
    });
  });

  return { 
      totalCount
    , prodDependencies
    , devDependencies };
}

module.exports = { report }
