import { devnull } from '../lib/utils';
import * as fs from 'fs-extra';
import * as yauzl from 'yauzl';
import * as path from 'path';
import { AuditOptions } from './audit-options';
import { ExtFile } from './ext-file';
import { GAV } from './gav';
import { MavenDependency } from './maven-dependency';
import { Readable } from 'stream';
import { StreamOptions } from './stream-options';
const EXTRACT_FILES_PATTERN = /(NOTICE|LICENSE|README|DEPENDENCIES|MANIFEST)(\.(TXT|MD|MF))?$/i;

function _readcontent(
  files: string[],
  o: StreamOptions,
  readcontentCallback: (err?: Error, extFiles?: ExtFile[]) => void ): void {
  Promise.all(files.map( (file) => {
    return new Promise( (resolve, reject) => {
      fs.readFile(file, 'utf8', (err, content) => {
        if (err) {
          return reject(err);
        }
        resolve({ file, content });
      });
    });
  }))
  .then( (ext: ExtFile[]) => readcontentCallback(null, ext))
  .catch( (err: Error) => readcontentCallback(err) );
}

function _getGAVPrefixedFile(gav: GAV, file: string): string {
  return `${gav.groupId}_${gav.artifactId}_${gav.version}_${path.basename(file)}`;
}

function _mvfiles(
    d: MavenDependency
  , files: string[]
  , o: StreamOptions
  , mvfilesCallback: (err?: Error, files?: string[]) => void): void {

    Promise.all(files.map( (file) => {
      const extfile = path.join(o.extPath, _getGAVPrefixedFile(d.gav, file));
      return new Promise ( (resolve, reject) => {
        fs.copyFile(file, extfile, (err) => {
          if (err) {
            return reject(err);
          }
          resolve(extfile);
        });
      });
    }))
    .then( (moved: string[]) => mvfilesCallback(null, moved) )
    .catch( (err: Error) => mvfilesCallback(err) );
  }

function _unzip(
    d: MavenDependency
  , o: StreamOptions
  , exttxtfilesCallback: (err?: Error, ret?: any) => void): void {

    const dirname = d.dirname;
    Promise.all(
      d.files.filter( (file) => /\.(jar|zip|rar|war|ear)/i.test(file))
        .map( (file) => {
          const extracted: string[] = [];

          return new Promise( (resolve, reject) => {
            const filepath = path.join(dirname, file);
            const folderpath = filepath.slice(0, -4);
            yauzl.open(
              filepath,
              { lazyEntries: true },
              (err: Error, zipfile: yauzl.ZipFile) => {
                if (err) {
                  reject(err);
                } else {
                  zipfile.readEntry();
                  zipfile.on('entry', (entry) => {
                    if (/\/$/.test(entry.filenName)) {
                      zipfile.readEntry();
                    } else {
                      zipfile.openReadStream(entry, (err2: Error, readStream: Readable) => {
                        if (err2) {
                          reject(err2);
                        }
                        readStream.on('end', () => {
                          zipfile.readEntry();
                        });

                        if (EXTRACT_FILES_PATTERN.test(entry.fileName)) {
                          const destFile = path.join(folderpath, entry.fileName);
                          extracted.push(destFile);
                          fs.ensureDir(path.parse(destFile).dir, (err3: Error) => {
                            if (err3) {
                              reject(err3);
                            }
                            readStream.pipe(fs.createWriteStream(destFile));
                          });
                        } else {
                          readStream.pipe(devnull());
                        }
                      });
                    }
                  })
                  .on('error', (err4: Error) => reject(err4) )
                  .on('close', (err5) => {
                    if (err5) {
                      return reject(err5);
                    }
                    _mvfiles(d, extracted, o, (err6: Error, _moved) => {
                      if (err6) {
                        return reject(err6);
                      }
                      _readcontent(extracted, o, (err7: Error, content) => {
                        if (err7) {
                          return reject(err7);
                        }
                        resolve({ content });
                      });
                    });
                  });
                }
              });
          });
        })
    )
    .then( (value) => exttxtfilesCallback(null, value) )
    .catch( (err: Error) =>  exttxtfilesCallback(err) );
}

export function extFilesStream(o: StreamOptions) {
  return (d: MavenDependency, cb: any) => {
    if (!o.extTxtFiles || !d.hasJarFile || !!d.extractedFiles) {
      cb(null, d);
    } else {
      _unzip(d, o, (err: Error, files) => {
        if (err) {
          o.log.write(err.message);
          d.extractedFiles = [];
        } else {
          d.extractedFiles = files;
        }
        cb(null, d);
      });
    }
  };
}
