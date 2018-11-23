import { StreamOptions } from './stream-options';
import { Dependency } from './dependency';
import { join } from 'path';
import { readFile } from 'fs';
import { Parser } from 'xml2js';
import { red } from 'colors';

const pomParser = new Parser({
  ignoreAttrs: true,
  explicitArray: false,
  tagNameProcessors: [(name) => name.replace(/\./g, '_')]
});

// const LICENSE_AT_PATTERN = /License[.\w\s~\.:,*]+at[.\w\s~\\.:,*]*((http|https):\/\/[^\s\\]+)\b/gmi;
// const LICENSE_AT_PATTERN = /License[.\w\s~\.:,*]+at[.\w\s~\\.:,*]*((http|https):\/\/[^\s\\]+)(\b|\s)/gmi;
const LICENSE_AT_PATTERN = /((http|https):\/\/[^\s\\]+)(\b|\s)/gmi;
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
    readFile(dependency.pomfile, { encoding: 'utf8', flag: 'r'}, (err: Error, xml: string) => {
      if (err) {
        options.log.write(err.message);
      }
      if (xml) {
        pomParser.parseString(xml, (err2, pom) => {
          if (err2) {
            options.log.write(err2.message);
          }
          const text = _grabFirstComment(xml);
          let url: string = null;
          if (text) {
            const matches = LICENSE_AT_PATTERN.exec(text);
            if (matches) {
              url = matches[1].trim();
              if (!url) {
                console.log(url);
              }
            } else {
              if (text) {
                options.log.write(text);
              }
            }
          }

          dependency.pom = pom;
          dependency.bestLicense = { name: null , url, text };
          cb(err, dependency);
        });
      } else {
        cb(null, dependency);
      }
    });
  };
}

export { pomStream };
