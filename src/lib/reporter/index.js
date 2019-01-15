const fs = require('fs')
  , path = require('path')
  , ejs = require('ejs');

/**
 * 
 * @param {*} options 
 * @param { {err:*, reporter:Array<*>}} callback 
 */
function _require(options = null, callback) {
  const reporterPath = (options || {}).reporterPath || __dirname;
  fs.readdir(reporterPath, (err, files) => {
    if (err) {
      return callback(err);
    }
    const reporter = files
      .filter( (f) => /\.js$/i.test(f) && !f.startsWith('_') && f !== 'index.js')
      .map( (rf) => require(path.resolve(reporterPath, rf)))
      .filter( (item) => typeof(item.report) === 'function');

    callback(null, reporter)
  })
}

/**
 * 
 * @param { {templatePath:string, representationState:string, renderEngine:string, defaultResource:string, defaultAction:string} } resolveOptions 
 */
function resolve(resolveOptions = null) {
  const defaultOptions = {  
      templatePath: path.resolve(__dirname, 'views')
    , representationState: 'txt'
    , renderEngine: 'ejs'
    , defaultResource: 'dependencies'
    , defaultAction: 'index' };
  
  const options = Object.assign({}, defaultOptions, (resolveOptions || {}))
  const templatePath = options.templatePath || path.resolve(__dirname, 'views');
  const representationState = options.representationState || 'txt';
  const renderEngine = options.renderEngine || 'ejs';
  const defaultResource = options.defaultResource || 'dependencies';
  const defaultAction = options.defaultAction || 'index';
  
  return (resource=null, action=null) => {
    const currentAction = action || defaultAction;
    const currentResource = resource || defaultResource;

    return path.resolve(
        templatePath
      , currentResource
      , representationState
      , `${currentAction}.${renderEngine}`);
  };
}

function report(reportOptions = null) {
  
  const options = reportOptions || {};

  /**
   * @returns {Promise<void|Error>}
   * @param {*} view 
   */
  return () => {
    return new Promise( (resolve, reject) => {
      _require(options, (err, reporter) => {
        if (err) {
          return reject(err);
        }
        return Promise.all(reporter.map( (rep) => rep.report(options)))
          .then( () => resolve(options) )
          .catch( (err) => reject(err) );
      })
    });
  }
}

/**
 * @param { {template:string, filename:string, title:string, query:*} } renderOptions
 * @param {*} options 
 */
function render(renderOptions, options) {

  const template = renderOptions.template || resolve()('dependencies');
  const filename = renderOptions.filename || 'dependencies.txt';
  const title = renderOptions.title || 'Title';
  const description = renderOptions.description || 'Description:'
  const query = renderOptions.query || { type: 'pom' }

  return new Promise( (resolve, reject) => {

    options.repoDb.find(query, (err, docs) => {
      if (err) {
        return reject(err)
      }
      const data = { title, description, dependencies: docs.sort((a,b) => a.fullname >= b.fullname ? 1:-1) };
      ejs.renderFile(template, data, { }, function(err, str) {
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
    })
  });
}

module.exports = { resolve, report, render };
