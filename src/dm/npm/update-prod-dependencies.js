const { fork } = require('child_process')
  , { resolve } = require('path')
  , { grey  } = require('chalk');

/**
 * Update repoDb with prod dependencies
 * @param {*} options 
 * @param {*} callback 
 */
function updateProdDependencies(options, callback) {
  const repoDb = options.repoDb
    , log = options.log
    , lsprod = fork(resolve(__dirname, 'list-prod-dependencies.js'));
  lsprod.send({ 
      cwd: options.cwd
    , log: options.log
    , registry: options.registry
    , command: options.command
  });
  lsprod.on('exit', (code, signal) => {
    // console.log(grey('fork prod dependencies updated'));
    console.log(grey(`finished with code/signal: ${code}/${signal}`));
    callback(options);
  })
  lsprod.on('message', (prodDependency) => {
    if (prodDependency) {
      repoDb.findOne({ fullname: prodDependency.fullname }, (err, d) => {
        if (err) {
          log.write(err.message);
        } else {
          if (d) {
            d.prod = true;
            repoDb.update({ _id: d._id }, d, {}, ( err, _numUpdated ) => {
              if (err) {
                log.write(err.message);
              }
            });
          }
        }
      })
    }
  })
}

module.exports = { updateProdDependencies };
