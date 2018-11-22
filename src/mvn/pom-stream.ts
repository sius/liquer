import { StreamOptions } from './stream-options';
import { Dependency } from './dependency';
import { join } from 'path';
import { readFile } from 'fs';
import { Parser } from 'xml2js';

const pomParser = new Parser({
  ignoreAttrs: true,
  explicitArray: false,
  tagNameProcessors: [(name) => name.replace(/\./g, '_')]
});

const LICENSE_AT_PATTERN = /License[.\w\s~\.,]+at[.\w\s~\.,]*((http|https):\/\/.*)\b/gmi;

function _grabFirstComment(xmlStr): string|null {
  let ret = null;
  if (!xmlStr) {
    return null;
  }
  const c0 = xmlStr.indexOf('<!--');
  if (c0 > -1) {
    const c1 = xmlStr.indexOf('-->');
    if (c1 > c0) {
      ret = xmlStr.substring(c0 + 4, c1 - 1);
    }
  }
  return ret;
}

function pomStream(options: StreamOptions)
: (dependency: Dependency, cb: (err: Error, data: Dependency) => void) => void {

  return (dependency: Dependency, cb: (err?: Error, dependency?: Dependency) => void) => {
    readFile(dependency.pomfile, { flag: 'r'}, (e, xml) => {
      if (e) {
        // log.write ...
      }
      if (xml) {
        const str = xml.toString();
        pomParser.parseString(str, (err, pom) => {
          if (err) {
            // log.write
          }
          const text = _grabFirstComment(str);
          let url = null;
          if (text) {
            const matches = LICENSE_AT_PATTERN.exec(text);
            if (matches && matches[1]) {
              url = matches[1].trim();
            }
          }

          dependency.pom = pom;
          dependency.bestLicense = { url, text };
          cb(err, dependency);
        });
      } else {
        cb(null, dependency);
      }
    });
  };
}

export { pomStream };
