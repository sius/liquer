const { spawn } = require('child_process');
const { resolve, join, basename } = require('path');
const { split, map, readArray } = require('event-stream');
const { copyFile, ensureDir, createWriteStream } = require('fs-extra');
const { xrayStream
  , artifactoryStream
  , repodbStream } = require('../../lib/transform');
const { dependencyStream
  , filesStream
  , extractRecoverStream
  , licenseStream
  , normalizeLicenseStream
  , logStream} = require('./transform');
const { updateRuntimeDependencies } = require('./update-runtime-dependencies')
const { timestamp } = require('../../lib/utils');
const chalk = require('chalk');
const os = require('os');
const Datasource = require('nedb');
const Reporter = require('../../lib/reporter');
const DEFAULT_OPTIONS = { 
    workingDirectory: 'audit'
  , file: 'pom.xml'
  , localRepoDir: 'repo'
  , extractedDir: 'ext'
  , remoteRepo: ''                                                      
  , goal: 'dependency:go-offline'
  , logFile: 'log.txt'
  , extractFiles: true
  , settings: join(os.homedir(), '.m2', 'settings.xml')
  , reporterPath: resolve('reporter')
  , templatePath: resolve('reporter/views') };

/**
 * Audit the dependencies of a pom file to go offline and 
 * generate run- and build-time dependency lists grouped 
 * by their licenses.
 * @param {*} options 
 */
function audit(options) {

  const effectiveOptions  = { ...DEFAULT_OPTIONS,  ...options };
  const workingDirectory  = effectiveOptions.workingDirectory
    , command             = effectiveOptions.command
    , goal                = effectiveOptions.goal
    , profile             = effectiveOptions.profile
    , remoteRepo          = effectiveOptions.remoteRepo
    , file                = effectiveOptions.file
    , logFile             = effectiveOptions.logFile
    , localRepoDir        = effectiveOptions.localRepoDir
    , extractFiles        = effectiveOptions.extractFiles
    , extractedDir        = effectiveOptions.extractedDir
    , reporterPath        = effectiveOptions.reporterPath
    , templatePath        = effectiveOptions.templatePath
    , xrayCredentials     = effectiveOptions.xrayCredentials
    , artifactoryCredentials= effectiveOptions.artifactoryCredentials
    , settings            = resolve(effectiveOptions.settings)
    , scanDir             = timestamp()
    , scanPath            = resolve(workingDirectory, scanDir)
    , srcPom              = resolve(file)
    , destPom             = resolve(scanPath, basename(file))
    , localRepo           = resolve(scanPath, localRepoDir)  
    , localRepoDbPath     = resolve(scanPath, `${localRepoDir}.db`)
    , extractedPath       = resolve(scanPath, extractedDir)
    , logPath             = resolve(scanPath, `${logFile}`)
    , repoDb              = new Datasource({ filename: localRepoDbPath, autoload: true });
   
  /**
   * Retrieve the full dependency info from the 'pom.xml' with the maven goal
   * dependency:go-offline, e.g.:
   * $ mvn '-s' ${settings} -f ${pom} -Dmaven.repo.local=${localRepo} dependency:go-offline
   */
  function _runCommand() {
    const log = createWriteStream(logPath, { flags: 'a+' })
      , opts = {
          command
        , scanPath, localRepo, log
        , extractFiles, extractedPath
        , pom: destPom
        , remoteRepo, repoDb, settings
        , profile 
        , reporterPath
        , templatePath
        , xrayCredentials
        , artifactoryCredentials };
    
    // build args
    const P = profile && profile.length > 0 ? `-P${profile}` : null
    const args = [ '-f', destPom ];
    if (settings) {
      args.push('-s', settings)
    }
    if (P) {
      args.push(P)
    }
    args.push(`-Dmaven.repo.local=${localRepo}`)
    args.push(goal);

    spawn(command, args)
      .stdout
        .pipe(split())
        .pipe(map(dependencyStream(opts)))
        .pipe(map(filesStream(opts)))
        .pipe(map(extractRecoverStream(opts)))

        /* Additional Licences Sources */
        .pipe(map(xrayStream(opts)))
        .pipe(map(artifactoryStream(opts)))

        /* License Management: aggregate and normalize licenses */
        .pipe(map(licenseStream(opts)))
        .pipe(map(normalizeLicenseStream(opts)))

        /* Save and log */
        .pipe(map(repodbStream(opts)))
        .pipe(map(logStream(opts)))
        .on('error', (err) => console.error( err ? err.message : 'unexpected error'))
        .on('end', () => {
          opts.repoDb.find({}, (err, docs) => {
            if (err) {
              opts.log.write(`${err.message}`)
            }
            console.log(`Updating repo.db with ${docs.length} dependencie(s)`)
            readArray(docs)
              .pipe(map(filesStream(opts)))
              .pipe(map(extractRecoverStream(opts)))

              /* License management */
              .pipe(map(licenseStream(opts)))
              .pipe(map(normalizeLicenseStream(opts)))
  
              /* Save and log */
              .pipe(map(repodbStream(opts)))
              .pipe(map(logStream(opts)))
              .on('end', () => {
                updateRuntimeDependencies(opts, (opts) => {
                  opts.repoDb.persistence.compactDatafile();
                  opts.repoDb.on('compaction.done', () => {
                    const report = Reporter.report(opts);
                    report().then(() => {
                      console.log(chalk.green('done'));
                      console.log(`see: ${scanPath}`);
                      process.exit(0);
                    });
                  })
                });
              })
              .pipe(process.stdout);
          })
        }).pipe(process.stdout);
  }

  const ensurePath = !!extractFiles
    ? resolve(workingDirectory, scanDir, extractedDir)
    : resolve(workingDirectory, scanDir);
  ensureDir(ensurePath, (e) => {
    if (e) {
      console.error(e);
      return process.exit(-1);
    }
    
    copyFile(srcPom, destPom, (err) => {
      if (err) {
        console.error(err.message);
        return process.exit(-1);
      }

      _runCommand();
    });
  });
} 

module.exports = { audit }
