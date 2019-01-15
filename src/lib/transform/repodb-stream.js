/**
 * Insert the dependency object into the repoDb
 * @returns  {(dependency:*, dependencyCallback: {(err:Error, updatedDependency:*) => void}) => void}
 * @param {*} options 
 */
function repodbStream(options) {
  
  return (dependency, cb) => {
    options.repoDb.update({ _id: dependency._id}, dependency, { upsert: true, returnUpdatedDocs: true }, (err, n, doc, upsert) => {
      if (err) {
        options.log.write(`${err.message}\n`)
      }
      cb(null, doc);
    });
  }
}

module.exports = { repodbStream }
