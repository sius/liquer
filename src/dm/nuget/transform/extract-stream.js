const { devnull, isArray 
  , objFromXmlFile } = require('../../../lib/utils')
  , opath = require('object-path')
  , fse = require('fs-extra')
  , yauzl = require('yauzl')
  , path = require('path');

function _extract(dependency, options, extractedNuspecCallback) {

  fse.readdir(dependency.component_path, (err, files) => {
    if (err) {
      return options.log.write(err.message);
    }
    if (!files) {
      return extractedNuspecCallback(null, dependency.component_path);
    }
    Promise.all(
      files
        .filter( (file) => /\.nupkg$/i.test(file))
        .map( (file) => {
          return new Promise( (resolve, reject) => {
            const nupkgFile = path.resolve(dependency.component_path, file);
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
                      });
                      if (/\.nuspec$/i.test(entry.fileName)) {
                        const destFile = path.resolve(dependency.component_path, path.basename(entry.fileName));
                        readStream
                          .on('end', () => {
                            objFromXmlFile(destFile, (err3, nuspec) => {
                              if (err3) {
                                return reject(err3)
                              }
                              const file = path.relative(options.localRepoDir, destFile);
                              const metadata = opath.get(nuspec, 'package.metadata');
                              resolve({ file, metadata })

                            });
                          })
                          .pipe(fse.createWriteStream(destFile));
                      } else {
                        readStream.pipe(devnull());
                      }
                    });
                  }
                })
                .on('error', (err) => reject(err))
              }
            });
          });
        })
    )
    .then( (value) => extractedNuspecCallback(null, value ) )
    .catch( (err) => extractedNuspecCallback(err) )
  })
}

/**
 * Extract .nuspec file and add content to the dependency object
 * @returns  {(dependency:*, dependencyCallback: {(err:*, dependency:*) => void}) => void}
 * @param {*} options 
 */
function extractStream(options) {
  return (dependency, cb) => {
    _extract(dependency, options, (err, pkg) => {
      if (err) {
        options.log.write(`[ERROR] ${err.message}\n`)
      }
      dependency.package = (isArray(pkg) && pkg.length > 0) ? pkg[0] : pkg;
      const metadata = opath.get(dependency, 'package.metadata');
      if (metadata) {
        // dependency.component_id_with_semantic_versioning
        dependency.component_id = `${metadata.id}-${metadata-version}`;
        dependency.fullname = dependency.component_id;
      }
      cb(null, dependency);
    })
  }
}

module.exports = { extractStream };
