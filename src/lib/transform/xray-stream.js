process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const request = require('request')
  , { getHttpResponseErrorBadge} = require('../badges');

/**
 * @param {{component_scheme:string, component_id:string}} dependency 
 * @param {{xrayCredentials:{credentials:{username:string, password:string}, api:string}}} options 
 * @param {(err:Error, xrayResponseBody:*) => void} cb 
 */
function _xray(dependency, options, cb) {
  const xray = options.xrayCredentials;
  const body = { 
    component_details: [
      { component_id: `${dependency.component_scheme}${dependency.component_id}` }
  ]};

  const auth = {
      user: xray.credentials.username
    , pass: xray.credentials.password
    , sendImmediately: true
  }
  request.post(`${xray.api}`, { json: true, body, auth }, (err, resp, body) => {
    if (err) {
      cb(err);
    } else {
      if (resp.statusCode === 200) {
        cb(null, body);
      } else {
        cb({ status: resp.statusCode, message: resp.statusMessage });
      }
    }
  });
}

/**
 * Append Xray info to the dependency stream object
 * @returns {(dependency, cb) => void}
 * @param {*} options 
 */
function xrayStream(options) {
  let disabled = false;
  return (dependency, cb) => {
    if ( !disabled && (dependency.type !== 'pom') && options.xrayCredentials) {
      _xray(dependency, options, (err, xrayResponseBody) => {
        if (err) {
          const badge = getHttpResponseErrorBadge(err, 'Xray');
          disabled = badge.disabled;
          console.error(badge.text);
        }
        // console.log(JSON.stringify(xrayResponseBody, null, 2));
        dependency.xray = xrayResponseBody;
        cb(null, dependency);
      }); 
    } else {
      cb(null, dependency);
    }
  }
}

module.exports = { xrayStream }
