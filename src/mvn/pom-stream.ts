import { StreamOptions } from './stream-options';
import { Dependency } from './dependency';
import { join } from 'path';
import { readFile } from 'fs';
import { Parser } from 'xml2js';
import { red } from 'colors';
import { getUrls } from 'get-urls';

const pomParser = new Parser({
  ignoreAttrs: true,
  explicitArray: false,
  tagNameProcessors: [(name) => name.replace(/\./g, '_')]
});

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
function getLicenseAtUrl(text): string {
  if (text) {
    const p0 = text.indexOf('License');
    if (p0 > -1) {
      const matches = /(https?:\/\/[^\s<>]+)[\b\s]?/gim.exec(text.substring(p0));
      if (!!matches) {
        return matches[1];
      } else {
        console.log(red(text));
      }
    }
  }
  return null;
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
          const url: string = getLicenseAtUrl(text);

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

export { pomStream, getLicenseAtUrl };
