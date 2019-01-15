
const buffer = require('buffer');
const isUtf8 = require('is-utf8');
const { Transform } = require('stream');
const { 
    startsWithUtf16BeBom
  , startsWithUtf16LeBom
  , startsWithUtf32BeBom
  , startsWithUtf32LeBom } = require('./bom');

/**
 * Transcodes utf32/utf16 to utf8 and removes BOM if necessary.
 * for use with first-chunk-stream configured for min. chunkLength: 4
 * TODO: remove first-chunk-stream dependency
 */
class Transcode extends Transform {

  constructor(opts) {
    super(opts);
    this._log = opts.log;
    this._file = opts.file;
    this._offset = 0;
    this._lastOddByte = null;
    this._firstChunk = null;
    this._swap16 = false;
    this._encoding = 'utf8'
  }

  _readFirstChunk(chunk) {
    let ret = chunk;
    if (!this._firstChunk) {
      this._firstChunk = chunk;
      this._encoding = 'ucs2'
      if (startsWithUtf16BeBom(chunk)) {
        this._log.write(`[INFO] transcode from utf16be to utf8!\n`)
        this._swap16 = true;
        ret = chunk.slice(2);
      } else if (startsWithUtf32BeBom(chunk)) {
        this._log.write(`[INFO] transcode from utf32be to utf8!\n`)
        this._swap16 = true;
        ret = chunk.slice(4);
      } else if (startsWithUtf16LeBom(chunk)) {
        this._log.write(`[INFO] transcode from utf16le to utf8!\n`)
        this._swap16 = false;
        ret = chunk.slice(2);
      } else if (startsWithUtf32LeBom(chunk)) {
        this._log.write(`[INFO] transcode from utf32le to utf8!\n`)
        this._swap16 = false;
        ret = chunk.slice(4);
      }
    }
    return ret;
  }

  _flush(callback) {
    if (this._lastOddByte) {
      callback(null, Buffer.from([this._lastOddByte]));
    }
  }
  /**
   * @param {Buffer} rawChunk 
   * @param {string} encoding 
   * @param {*} callback 
   */
  _transform(rawChunk, encoding, callback) {
    let chunk = rawChunk;
    if (isUtf8(chunk)) {
      this._offset += chunk.length;
      callback(null, chunk);
    } else {
      chunk = this._readFirstChunk(chunk);
      const len = chunk.length;
      if (len > 0) {
        if (len % 2 == 0) {
          if (this._lastOddByte) {
            const newOddByte = chunk[0]
            chunk[0] = this._lastOddByte;
            this._lastOddByte = newOddByte;
          } 
        } else {
          if (this._lastOddByte) {
            const oddBuffer = Buffer.from([this._lastOddByte]);
            this._lastOddByte = null;
            chunk = Buffer.concat([oddBuffer, chunk]);
          } else {
            this._lastOddByte = chunk[len-1];
            chunk = chunk.slice(0, -1)
          }
        }
      }
      this._offset += chunk.length;
      if (chunk.length > 0) {
        if (this._swap16) {
          chunk = chunk.swap16();
        }
        if (this._encoding === 'ucs2') {
          chunk = buffer.transcode(chunk, 'ucs2', 'utf8')
        }
      }
      callback(null, chunk);
    }
  }
}

module.exports = { Transcode }
