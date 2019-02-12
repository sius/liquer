const { spawn } = require('child_process')
  , { resolve, dirname } = require('path')
  , { map, split } = require('event-stream')
  , { ensureDir, createWriteStream } = require('fs-extra')
  , { xrayStream
    , artifactoryStream
    , repodbStream } = require('../../lib/transform')
  , { dependencyStream
    , licenseStream
    , logStream } = require('./transform')
  , { timestamp, copyInput } = require('../../lib/utils')
  , { updateProdDependencies } = require('./update-prod-dependencies')
  , Reporter = require('../../lib/reporter')
  , chalk = require('chalk')
  , Datasource = require('nedb');

const packageJson = 'package.json';
const packageLockJson = 'package-lock.json';
const DEFAULT_OPTIONS = {
    package: ''
  , localRepoDir: 'repo'
  , remoteRepo: null
  , log: 'npm.log'
  , reporterPath: resolve(__dirname, 'reporter')
  , templatePath: resolve(__dirname, 'reporter/views')
};

function _runCommand(options) {
  "use strict";

  const workingDirectory = options.workingDirectory
    , command = options.command
    , packagePath = options.package
    , file = resolve(packagePath, packageJson) 
    , packageDir = dirname(file)
    , lockFile = resolve(packageDir, packageLockJson)
    , outputPath = resolve(workingDirectory, timestamp())
    , fileDest = resolve(outputPath, packageJson)
    , lockFileDest = resolve(outputPath, packageLockJson)
    , logFile = resolve(outputPath, `${options.log}`)
    , localRepoDir = options.localRepoDir
    , localRepoDbPath = resolve(outputPath, `${localRepoDir}.db`);

  const repoDb = new Datasource({ filename: localRepoDbPath, autoload: true })
    , registry = DEFAULT_OPTIONS.remoteRepo
    , verbose = false;

  ensureDir(outputPath, (err) => {
    if (err) {
      console.error(err)
      return process.exit(-1);
    }

    // copy package.json and package-lock.json if exists
    copyInput(file, fileDest);
    copyInput(lockFile, lockFileDest, true);
    // create log file
    const log = createWriteStream(logFile, { flags: 'a+' })
    const cwd = resolve(process.cwd(), outputPath);
    const packageLock = {};
    const opts = { ...options, verbose, registry, outputPath, cwd, log, repoDb, packageLock };
    const args = ['ci', '-d','--registry', DEFAULT_OPTIONS.remoteRepo]
    const spawnOptions = { 
        stdio:  [null, null, 'pipe']
      , cwd
      , env: process.env }; 
    spawn(command, args, spawnOptions)
      .stdio[2]
      .pipe(split())
      .pipe(map(dependencyStream(opts)))
      .pipe(map(xrayStream(opts)))
      .pipe(map(artifactoryStream(opts)))
      .pipe(map(licenseStream(opts)))
      .pipe(map(repodbStream(opts)))
      .pipe(map(logStream(opts)))
      .on('error', (err1) => console.error(err1) )
      .on('end', () => {
        updateProdDependencies(opts, (opts) => {
          opts.repoDb.persistence.compactDatafile();
          opts.repoDb.on('compaction.done', () => {
            const report = Reporter.report(opts);
            report().then(() => {
              console.log(chalk.green('done'));
              console.log(`see: ${outputPath}`);
              process.exit(0);
            });
          })
        });
      })
      .pipe(process.stdout);
  });
}

/**
 * Audit the dependencies of a package file to go offline and 
 * generate run- and build-time dependency lists grouped 
 * by their licenses.
 * @param {*} options 
 */
function audit(options) {
  _runCommand({ ...DEFAULT_OPTIONS, ...options });
}

module.exports = { audit }
