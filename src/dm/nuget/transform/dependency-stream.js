const path = require('path');

/**
 * Transforms the package folder name stream into a dependency object stream
 * @returns  {(line:string, dependencyCallback: {(err:*, dependency:*) => void}) => void}
 * @param {*} options 
 */
function dependencyStream(options) {
  const pkg_type = 'nuget';

  return (line, cb) => {
    
    const component_path = line;
    const component_id = path.basename(line);
    const component_scheme = 'nuget://';
    const fullname = component_id;
    const dependency = {
        pkg_type
      , component_id
      , component_scheme
      , component_path
      , fullname
      , license: { resolved: false }
    }
    cb(null, dependency);
  }
}

module.exports = { dependencyStream };
