const path = require('path')
  , liquer = require('./shared/liquer')
  , Reporter = require('../../../lib/reporter')

/**
 * @returns {Promise<void|Error>}
 * @param {*} options 
 */
function report(options) {
  const resolve = Reporter.resolve(options)
  const template = resolve('liquer');
  const filename = path.join(options.scanPath, 'BuildToolDependencies.txt');
  const title = '';
  const description = 'Tool/Build dependencies';
  const query = { 
      type: 'pom'
    , 'dlist.scope': { $nin: [ 'compile', 'runtime' ] } };

    return liquer.renderTemplate({ template, filename, title, description, query }, options);
}

module.exports = { report }
