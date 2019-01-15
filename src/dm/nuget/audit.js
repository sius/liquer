
const { spawn } = require('child_process')
  , { resolve } = require('path')
  , { map, split } = require('event-stream')
  , { ensureDir, createWriteStream } = require('fs-extra')
  , { dependencyStream, logStream, nuspecStream } = require('./transform')
  , { repodbStream } = require('../../lib/transform')
  , { timestamp, copyInput } = require('../../lib/utils')
  , Datasource = require('nedb')
  , Reporter = require('../../lib/reporter')
  , chalk = require('chalk');

const packagesConfig = 'packages.config';
const DEFAULT_OPTIONS = {
    packagesConfig
  , workingDirectory: 'audit/nuget'
  , ConfigFile: null 
  , DirectDownload: true
  , ForceEnglishOutput: true
  , Prerelease: false
  , Source: []
  , FallbackSource: []
  , localRepoDir: 'repo'
  , log: 'log.txt'
  , reporterPath: resolve(__dirname, 'reporter')
  , templatePath: resolve(__dirname, 'reporter/views')
};

function _runCommand(options) {
  const command = options.command;
  const workingDirectory = options.workingDirectory;
  const outputPath = resolve(workingDirectory, timestamp());
  const file = resolve(options.packagesConfig);
  const fileDest = resolve(outputPath, packagesConfig);
  const ConfigFile = options.ConfigFile;
  const logFile = resolve(outputPath, options.log);
  const localRepoDir = resolve(outputPath, options.localRepoDir);
  const localRepoDbPath = resolve(outputPath, `${options.localRepoDir}.db`);
  const repoDb = new Datasource({ filename: localRepoDbPath, autoload: true });

  ensureDir(outputPath, (err) => {
    if (err) {
      console.error(err)
      return process.exit(-1);
    }

    // copy packages.config
    copyInput(file, fileDest);

    // create log file
    const log = createWriteStream(logFile, { flags: 'a+' })
    const cwd = outputPath
    const opts = { ...options, cwd, log, repoDb, localRepoDir, ConfigFile };
    
    const args = ['install', fileDest, '-NoCache', '-ConfigFile', ConfigFile, '-OutputDirectory', localRepoDir];
    const spawnOptions = { 
      stdio:  ['pipe', 'pipe', 'pipe']
    , env: process.env }; 

    spawn(command, args, spawnOptions)
    .stdio[1]
    
    .pipe(split())
    .pipe(map(dependencyStream(opts)))
    .pipe(map(nuspecStream(opts)))
    .pipe(map(repodbStream(opts)))
    .pipe(map(logStream(opts)))
    .on('error', (err1) => console.error(err1) )
    .on('end', () => {
      const report = Reporter.report(opts);
      report().then(() => {
        console.log(chalk.green('done'));
        console.log(`see: ${outputPath}`);
        process.exit(0);
      });
    })
    .pipe(process.stdout);
  });
}

/**
 * Audit the dependencies of a packages.config file
 * @param {*} options 
 */
function audit(options) {
  const effectiveOptions = { ...DEFAULT_OPTIONS, ...options };
  _runCommand(effectiveOptions);
}

module.exports = { audit }
