const path = require('path')
  , liquer = require('./shared/liquer')
  , Reporter = require('../../../lib/reporter');

/**
 * @returns {Promise<void|Error>}
 * @param {*} options 
 */
function report(options) {
  const resolve = Reporter.resolve(options);
  const template = resolve('liquer');
  const filename = path.join(options.cwd, "ProdDependencies.txt");
  const title = '';
  const description = 'Prod dependencies';
  const query = { prod: true };
  return liquer.renderTemplate({ template, filename, title, description, query }, options);
}

module.exports = { report }
