const isUtf8 = require('is-utf8');

// Byte order marks
const utf8_BOM = [0xEF, 0xBB, 0xBF];
const utf16le_BOM = [0xFF, 0xFE];
const utf16be_BOM = [0xFE, 0xFF];
const utf32le_BOM = [0xFF, 0xFE, 0x00, 0x00];
const utf32be_BOM = [0x00, 0x00, 0xFE, 0xFF];

/**
 * Strip 0xEF, 0xBB, 0xBF
 * @returns {Buffer}
 * @param {Buffer} b 
 */
function stripUtf8Bom(b) {
  if (!Buffer.isBuffer(b)) {
    throw new TypeError('Expected a Buffer, got ' + typeof b);
  }
  if (b[0] === 0xEF && b[1] === 0xBB && b[2] === 0xBF && isUtf8(b)) {
		return b.slice(3);
  }
  return b;
}

/**
 * @returns {boolean}
 * @param {Buffer} b 
 */
function startsWithUtf16BeBom(b) {
  if (!b || b.length < 2) {
    return false;
  }
  return (b[0] === 0xFE && b[1] === 0xFF);
}

/**
 * @returns {boolean}
 * @param {Buffer} b 
 */
function startsWithUtf16LeBom(b) {
  if (!b || b.length < 2) {
    return false;
  }
  return (b[0] === 0xFF && b[1] === 0xFE);
}

/**
 * @returns {boolean}
 * @param {Buffer} b 
 */
function startsWithUtf32BeBom(b) {
  if (!b || b.length < 4) {
    return false;
  }
  return (b[0] === 0x00 && b[1] === 0x00 && b[2] === 0xFE && b[3] === 0xFF);
}

/**
 * @returns {boolean}
 * @param {Buffer} b 
 */
function startsWithUtf32LeBom(b) {
  if (!b || b.length < 4) {
    return false;
  }
  return (b[0] === 0xFF && b[1] === 0xFE && b[2] === 0x00 && b[3] === 0x00);
}

module.exports = { 
    stripUtf8Bom
  , startsWithUtf16BeBom
  , startsWithUtf16LeBom
  , startsWithUtf32LeBom
  , startsWithUtf32BeBom
  , utf8_BOM
  , utf16le_BOM
  , utf16be_BOM
  , utf32le_BOM
  , utf32be_BOM 
}
