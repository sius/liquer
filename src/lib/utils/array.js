/**
 * @returns {boolean} true if obj is an Array
 * @param {*} obj 
 */
function isArray(obj) {
  return (!!obj) && (obj.constructor === Array);
}

module.exports = { isArray }
