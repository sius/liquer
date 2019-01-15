const path = require('path');

/**
 * Transforms the maven log lines into a stream object (the dependency)
 * @returns  {(line:string, dependencyCallback: {(err:*, dependency:*) => void}) => void}
 * @param {*} options 
 */
function dependencyStream(options) {
  const localRepo = options.localRepo;
  const pkg_type = 'maven';
  const downloadedPattern = new RegExp(`Downloaded\.*: (${options.remoteRepo}/(.+\.(pom|jar|war|ear|rar|zip)))`);

  return (line, cb) => {
    options.log.write(`${line}\n`);
    let res = downloadedPattern.exec(line);
    if (res) {
      const downloaded= res[1]
        , filepath    = res[2]
        , extname     = res[3]
        , type        = extname
        , parts       = filepath.split('/')
        , filename    = parts.pop()
        , version     = parts.pop()
        , artifactId  = parts.pop()
        , groupId     = parts.join('.')
        , dirname     = path.join(localRepo, path.dirname(filepath))
        , gav = { groupId, artifactId, version }
        , component_id = `${groupId}:${artifactId}:${version}`
        , component_scheme = 'gav://'
        , doc = { 
            downloaded
          , pkg_type
          , filename
          , extname
          , type
          , dirname
          , gav
          , component_id
          , component_scheme
          , pom: null
          , license: null
        }
      cb(null, doc)
    } else {
      cb()
    }
  }
}

module.exports = { dependencyStream }
