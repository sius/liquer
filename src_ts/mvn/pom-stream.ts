import { StreamOptions } from './stream-options';
import { MavenDependency } from './maven-dependency';
import { readFile, readdir } from 'fs';
import { Parser } from 'xml2js';
import { pathExists } from 'fs-extra';
import * as path from 'path';
import { AuditOptions } from './audit-options';
import { dependencyStream } from './dependency-stream';
import { callbackify } from 'util';

const pomParser = new Parser({
  ignoreAttrs: true,
  explicitArray: false,
  tagNameProcessors: [(name) => name.replace(/\./g, '_')]
});

const BOM_NODE_BLACKLIST: string[] = ['dependencies'];

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
function _getLicenseUrl(text): string {
  if (text) {
    const p0 = text.indexOf('License');
    if (p0 > -1) {
      const matches = /(https?:\/\/[^\s<>]+)[\b]?/gim.exec(text.substring(p0));
      if (!!matches) {
        return matches[1];
      }
    }
  }
  return null;
}

function _fileEndsWith(dirname: string, files: string[], dotExt: string): string {
  if (!!files) {
    const lowerDotExt = (dotExt || '').toLowerCase();
    const file = files.find( (f) => (f||'').endsWith(lowerDotExt));
    if (!!file) {
      return path.join(dirname, file);
    }
  }
  return null;
}
function _ftostr(
    filename: string
  , o: StreamOptions
  , cb: any): void {
  if (filename) {
    readFile(filename, 'utf8', (err, data) => {
    if (err) {
      o.log.write(err.message);
    }
    cb(null, data);
    });
  } else {
    cb(null, null);
  }
}

function _pom(
    pomfile: string
  , o: StreamOptions
  , cb: any): void {
    if (pomfile) {
      readFile(pomfile, 'utf8', (err, xml) => {

      if (xml) {
        pomParser.parseString(xml, (err2, pom) => {
          if (err2) {
            // options.logFile.write(`${err2}\n`);
          }

          const names = [];
          const title = null;
          const text = _grabFirstComment(xml);
          const url =  _getLicenseUrl(text);
          const license = { names, title, text, url };
          cb(null, { license, pom });
        });
      } else {
        cb(null, null);
      }
    });
  } else {
    cb(null, null);
  }
}

function _detectBOM(d: MavenDependency): boolean {
  const pom = d.pom;
  if (pom.project) {
    const noJar = !d.hasJarFile;
    const noJarPackaging = !('jar' === pom.project.packaging);
    const extnameIsPom = ('pom' === d.extname);
    // const found = Object.keys(pom.project).find((attr: string) => BOM_NODE_BLACKLIST.includes(attr));
    const nameHint = /bom$/i.test(d.gav.artifactId) || /bom$/i.test(pom.project.name);
    const dmHint = ( pom.project.dependencyManagement
      && pom.project.dependencyManagement.dependencies
      && pom.project.dependencyManagement.dependencies.dependency);

    return (/* !found && */ (nameHint || dmHint) && noJar && noJarPackaging && extnameIsPom);
  }
  return false;
}

function _downloadedInfo(
  d: MavenDependency,
  o: StreamOptions,
  cb: (d: MavenDependency) => void): void {
    const dirname = d.dirname;

    readdir(dirname, (err: Error, files: string[]) => {

      const pomfile = _fileEndsWith(dirname, files, '.pom');
      const pomSha1File = _fileEndsWith(dirname, files, '.pom.sha1');
      const jarfile = _fileEndsWith(dirname, files, '.jar');
      const jarSha1File = _fileEndsWith(dirname, files, '.jar.sha1');

      d.files = files;
      d.hasPomFile = (!!pomfile);
      d.hasJarFile = (!!jarfile);
      d.license = { names: [], title: null, text: null, url: null };

      _ftostr(pomSha1File, o, (sha1) => {
        d.pomSha1 = sha1;
        _ftostr(jarSha1File, o, (_sha1) => {
          d.jarSha1 = sha1;

          if (d.pom) {
            d.isBOM = _detectBOM(d);
            cb(d);
          } else {
            d.isBOM = false;
            if (d.hasPomFile) {
            _pom(pomfile, o, (data) => {
              if (data) {
                d.license = data.license;
                d.pom = data.pom;
                d.isBOM = _detectBOM(d);
              }
              cb(d);
            });
          } else {
            cb(d);
          }
        }
      });
    });
  });
}

export function pomStream(o: StreamOptions)
  : (dependency: MavenDependency, cb: (err: Error, data: MavenDependency) => void) => void {

  return (
      d: MavenDependency
    , cb: (err: Error, data: MavenDependency) => void) => {
      _downloadedInfo(d, o, (d2: MavenDependency) => {
        cb(null, d2);
      });
  };
}
