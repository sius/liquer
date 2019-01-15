const path = require('path')
  , liquer = require('./shared/liquer')
  , Reporter = require('../../../lib/reporter');
  
/**
 * @returns {Promise<void|Error>}
 * @param {*} options 
 */
function report(options) {
  const resolve = Reporter.resolve(options)
  const template = resolve('liquer');
  const title = '';
  const filename = path.join(options.scanPath, 'RuntimeDependencies.txt');
  const description = 'Runtime dependencies';
  const query = { 
      type: 'pom'
    , 'dlist.scope': { $in: [ 'compile', 'runtime' ] } };

  return liquer.renderTemplate({ template, filename, title, description, query }, options);
}

module.exports = { report }
