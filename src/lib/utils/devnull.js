const { Writable } = require('stream');

function _setImmediate(f) { 
  setTimeout(f, 0); 
}

function devnull(options) {
  const opts = options || {}

  return new Writable({
    ...opts,
    write(_chunk, _encoding, cb) {
      _setImmediate(cb);
    }
  });
}

module.exports = { devnull }
