module.exports = {
    ...require('./dependency-stream')
  , ...require('./files-stream')
  , ...require('./extract-recover-stream')
  , ...require('./license-stream')
  , ...require('./normalize-license-stream')
  , ...require('../../../lib/transform/repodb-stream')
  , ...require('./log-stream')
}
