// const pkg_types = ['npm', 'nuget', 'pypi', 'maven', 'gem']

/**
 * @returns {boolean} true if obj is an Array
 * @param {*} obj 
 */
function isArray(obj) {
  return (!!obj) && (obj.constructor === Array);
}

module.exports = {
  isArray
, ...require('./devnull')
, ...require('./format')
, ...require('./fs')
, ...require('./json')
, ...require('./string')
, ...require('./bom')
, ...require('./transcode')
}
