let { fork    } = require('child_process')
  , { resolve } = require('path')
  , { grey  } = require('chalk');

/**
 * Update repoDb with maven scope info 
 * @param {*} options 
 * @param {*} callback 
 */
function updateRuntimeDependencies(options, callback) {
  let repoDb    = options.repoDb
    , log       = options.log
    , dlist     = fork(resolve(__dirname, 'dependency-list.js'));
  dlist.send({
      command: options.command
    , settings  : options.settings
    , localRepo : options.localRepo
    , remoteRepo: options.remoteRepo
    , pom       : options.pom });
  dlist.on('exit', (code, signal) => {
    // console.log(grey('updated runtime scope dependencies'));
    console.log(grey(`finished with code/signal: ${code}/${signal}`));
    callback(options)
  })
  dlist.on('message', (dlistInfo) => {
    if (dlistInfo) {
      const groupId = dlistInfo.groupId;
      const artifactId = dlistInfo.artifactId;
      const version = dlistInfo.version;
      const gav = { groupId, artifactId, version }
      repoDb.find( { gav } , (err, dependencies) => {
          if (err) {
            log.write(err.message)
          } else {
            for (d of dependencies) {
              d.dlist = dlistInfo;
              repoDb.update({ _id: d._id }, d, {}, ( err, _numUpdated ) => {
                if (err) {
                  log.write(err.message)
                }
              })
            }
          }
      })
    }
  })
}

module.exports = { updateRuntimeDependencies }
