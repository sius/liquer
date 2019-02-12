const fs = require('fs')
  , iconv = require('iconv-lite')
  , xml2js = require('xml2js')
  , pomParser = new xml2js.Parser({
      ignoreAttrs: true,
      explicitArray: false,
      tagNameProcessors: [(name) => name.replace(/\./g, '_')]
    })
  , {
    startsWithUtf16BeBom
  , startsWithUtf16LeBom } = require('./bom');

/**
 * @param {string} file 
 * @param { { err: Error, xml:*} } xmlCallback 
 */
function objFromXmlFile(file, xmlCallback) {

  fs.readFile(file, (err, buffer) => {
    if (err) {
      return xmlCallback(err);
    }
    if (!buffer) {
      return xmlCallback(new Error("Invalid argument: file"));
    }
    const xmlStr = ((b) => {
      if (startsWithUtf16BeBom(b)) return iconv.decode(b, 'utf16-be');
      else if (startsWithUtf16LeBom(b)) return iconv.decode(b, 'utf16-le');
      else return iconv.decode(b, 'utf8');
    })(buffer);

    objFromXmlString(xmlStr, xmlCallback);
  });
}

/**
 * @param {string} xmlStr 
 * @param { (err: Error, xml:*) => void } xmlCallback 
 */
function objFromXmlString(xmlStr, xmlCallback) {
  pomParser.parseString(xmlStr, (err, pom) => {
    xmlCallback(err, pom)
  })
}

module.exports = { objFromXmlFile, objFromXmlString }
