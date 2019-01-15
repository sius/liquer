const fs = require('fs')
  , path = require('path')
  , ejs = require('ejs')
  , Reporter = require('../../../lib/reporter')
  , utils = require('../../../lib/utils')

/**
 * Read repo.db file and create README.txt file
 * @returns {Promise<void|Error>}
 * @param {*} options 
 */
function report(options) {
  const resolve = Reporter.resolve(options)
  const template = resolve('readme')
  const filename = path.join(options.scanPath, "README.txt");
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

  let otherTypesObj = { };
  let totalCount = docs.length;
  let pomCount = 0;
  let jarCount = 0;
  let otherCount = 0;
  let runtimeDependencyCount = 0;
  let toolDependencyCount = 0;
  
  docs.forEach((d) => {
    if (d.dlist && utils.isArray(d.dlist.scope) && d.dlist.scope.find(s => /runtime|compile/i.test(s))) {
      runtimeDependencyCount++;
    } else {
      toolDependencyCount++;
    }
    if (d.type === 'pom') {
      pomCount++;
     
    } else if (d.type === 'jar') {
      jarCount++;
      
    } else {
      otherCount++;
      let tNum = otherTypesObj[d.type];
      if (tNum) {
        otherTypesObj[d.type] = ++tNum
      } else {
        otherTypesObj[d.type] = 1;
      }
      
    }
  });

  const otherTypesCount = Object.keys(otherTypesObj)
    .map((type) => { return { type, count: otherTypesObj[type] }; })
    .sort((a,b) => a.type > b.type ? 1: -1)

  const counter = {
      totalCount, pomCount, jarCount
    , otherCount, otherTypesCount
    , runtimeDependencyCount, toolDependencyCount
  }
  
  return { counter };
}

module.exports = { report }
