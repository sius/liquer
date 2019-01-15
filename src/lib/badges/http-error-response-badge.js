const { red, yellow, grey } = require('chalk');

/**
 * converts the http response error into an error message
 * @returns {{disabled:boolean, lines:Array<string>}}
 * @param {string} backendName 
 */
function getHttpResponseErrorBadge(err, backendName) {

  let disabled = false;
  const lines = [];
  if (err) {
    
    if (err.status >= 400) {
      if (err.status === 404) {
        lines.push(grey(`FKA [INFO] ${backendName} responded with '${err.message}', Status: ${err.status}`));
      } else {
        disabled = true;
        lines.push(red(`FKA [ERROR] ${backendName} responded with '${err.message}', Status: ${err.status}`));
        lines.push(yellow(`FKA [WARNING] ${backendName} Audit has been disabled because of an unrecoverable error!`));
      }
    }
  }

  return { disabled, text: lines.join('\n') };
  
}

module.exports = { getHttpResponseErrorBadge }
