const  { cyan, grey } = require('chalk');

/**
 * @returns merged type: 'jar', filetype, packaging, 'pom'/BOM
 * @param {*} dependency 
 */
function _getMergedType(dependency) {
  let ret = null;
  if (dependency.hasJarFile) {
    ret = 'jar';
    if (dependency.pom && dependency.pom.project.packaging && ('jar' !== dependency.pom.project.packaging)) {
      ret += ` (packaging: ${dependency.pom.project.packaging})`;
    }
  } else if (dependency.hasPomFile) {
    ret = 'pom';
  }
  return ret;
}

/**
 * Create a full qualified dependency name
 * @returns { string }
 * @param { { component_id: string } } dependency 
 */
function getFullName(dependency) {
  return `${dependency.component_id}:${_getMergedType(dependency)}`;
}

/**
 * Create a full qualified colored dependency name
 * @returns { string } 
 * @param { { gav: {groupId:string, artifactId:string, version:string }, pom:* } dependency 
 */
function getFullNameBadge(dependency) {
  const ret = [
      cyan(dependency.gav.groupId) 
    , cyan(dependency.gav.artifactId)
    , cyan(dependency.gav.version)
    , grey(_getMergedType(dependency))
   ];
  return ret.join(':');
}

module.exports = { getFullNameBadge, getFullName }
