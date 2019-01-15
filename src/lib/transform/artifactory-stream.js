process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const request = require('request')
  , { getHttpResponseErrorBadge} = require('../badges');

/**
 * @param {{component_scheme:string, component_id:string}} dependency 
 * @param {{artifactoryCredentials:{credentials:{username:string, password:string}, api:string}}} options 
 * @param {(err:Error, artifactoryResponseBody:*) => void} cb 
 */
function _artifactory(dependency, options, cb) {
  const artifactory = options.artifactoryCredentials;
  const body = {  };
  const auth = {
      user: artifactory.credentials.username
    , pass: artifactory.credentials.password
    , sendImmediately: true
  }
  // console.log(dependency.jarSha1);
  request.get(`${artifactory.api}/search/dependency`, { json: true, body, auth, qs: dependency.jarSha1, useQuerystring: true }, (err, resp, body) => {
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
 * Append the artifactory info to the dependency stream object
 * @returns  {(dependency:*, dependencyCallback: {(err:*, dependency:*) => void}) => void}
 * @param {*} options 
 */
function artifactoryStream(options) {
  let disabled = false;
  return (dependency, cb) => {
    if ( !disabled && (dependency.type !== 'pom') && options.artifactoryCredentials) {
      _artifactory(dependency, options, (err, artifactoryResponseBody) => {
        if (err) {
          const badge = getHttpResponseErrorBadge(err, 'Artifactory');
          disabled = badge.disabled;
          console.error(badge.text);
        }
        console.log(JSON.stringify(artifactoryResponseBody, null, 2));
        dependency.artifactory = artifactoryResponseBody;
        cb(null, dependency);
      }); 
    } else {
      cb(null, dependency);
    }
  }
}

module.exports = { artifactoryStream } 
