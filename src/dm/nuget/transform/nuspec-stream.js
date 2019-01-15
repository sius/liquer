const { devnull } = require('../../../lib/utils')
  , { stripUtf8Bom, Transcode } = require('../../../lib/utils')
  , firstChunkStream = require('first-chunk-stream')
  , fse = require('fs-extra')
  , yauzl = require('yauzl')
  , path = require('path')
  , xml2js = require('xml2js')
  , nuspecParser = new xml2js.Parser({
      ignoreAttrs: true,
      explicitArray: false,
      tagNameProcessors: [(name) => name.replace(/\./g, '_')]
    }
  );

function _extract(dependency, options, extractedTextFilesCallback) {
  if (!dependency.component_path) {
    return console.log(`Invalid component path`)
  }
  const resolvedComponentPath = path.resolve(options.localRepoDir, dependency.component_path);
  fse.readdir(resolvedComponentPath, (err, files) => {
    if (err) {
      options.log.write(err.message)
      return;
    }
    if (!files) {
      return extractedTextFilesCallback(null, resolvedComponentPath)
    }
    Promise.all(
      files
        .filter( (file) => /\.nupkg$/i.test(file))
        .map( (file) => {
          const extracted = [];
          return new Promise( (resolve, reject) => {
            const nupkgFile = path.join(resolvedComponentPath, file);
            yauzl.open(nupkgFile, { lazyEntries: true }, (err1, zipfile) => {
              if (err1) {
                return reject(err1);
              } else {
                zipfile.readEntry();
                zipfile.on('entry', (entry) => {
                  if(/\/$/.test(entry.fileName)) {
                    zipfile.readEntry();
                  } else {
                    zipfile.openReadStream(entry, (err2, readStream) => {
                      if (err2) { 
                        return reject(err2); 
                      }
                      readStream.on('end', () => {
                        zipfile.readEntry();
                      })
                      if (/\.nuspec$/i.test(entry.fileName)) {
                        const destFile = path.join(resolvedComponentPath, path.basename(entry.fileName));
                        readStream
                          .on('end', () => {
                              
                            fse.readFile(destFile, (err3, buffer) => {
                              if (err3) {
                                return reject(err3)
                              }

                              nuspecParser.parseString(buffer, (err4, nuspec) => {
                                if (err4) {
                                  console.log(err4)
                                  return reject(err4)
                                }
                                const file = path.relative(options.localRepoDir, destFile);
                                const metadata = nuspec.package.metadata;
                                const data = { file, metadata };
                                extracted.push(data);
                                resolve(extracted)
                              });
                            });
                          })
                          .pipe(
                            firstChunkStream({ chunkLength: 5 }, (err, chunk, enc, cb) => {
                              if (err) {
                                cb(err);
                                return;
                              }
                              cb(null, stripUtf8Bom(chunk));
                            }))
                          .pipe(new Transcode({ log: options.log,  }))
                          .pipe(fse.createWriteStream(destFile));
                      } else {
                        readStream.pipe(devnull());
                      }
                    })
                  }
                })
                .on('error', (err) => reject(err))
                .on('close', (err) => {
                  if (err) { 
                    return reject(err);
                  }
                  resolve(extracted)
                })
              }
            })
          })
        })
    )
    .then( (value) => extractedTextFilesCallback(null, value.flat() ) )
    .catch( (err) => extractedTextFilesCallback(err) )
  })
}

/**
 * Extract .nuspec file and add content to the dependency object
 * @returns  {(dependency:*, dependencyCallback: {(err:*, dependency:*) => void}) => void}
 * @param {*} options 
 */
function nuspecStream(options) {
  return (dependency, cb) => {
    _extract(dependency, options, (err, packages) => {
      if (err) {
        options.log.write(`[ERROR] ${err.message}\n`)
      }
      dependency.package = packages;
      
      cb(null, dependency);
    })
  }
}

module.exports = { nuspecStream };
