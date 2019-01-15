const moment = require('moment');

/**
 * Creates a filesystem friendly timestamp string.
 * @returns {string}
 * @param {*} date 
 */
function timestamp(date = null) {
  if (!date) {
    date = Date.now();
  }
  return moment(date).format('YYYYMMDD-HHmmss-SSS');
}

module.exports = { timestamp };
