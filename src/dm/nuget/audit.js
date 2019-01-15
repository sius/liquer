
const { spawn } = require('child_process')
  , { resolve, basename } = require('path')
  , { map, split } = require('event-stream')
  , { ensureDir, createWriteStream } = require('fs-extra')
  , { dependencyStream, logStream, nuspecStream } = require('./transform')
  , { repodbStream } = require('../../lib/transform')
  , { timestamp, copyInput } = require('../../lib/utils')
  , Datasource = require('nedb');

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
  const configFile = options.configFile;
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
    const opts = { log, repoDb, localRepoDir };
    
    const args = ['install', fileDest, '-NoCache', '-ConfigFile', './src/dm/nuget/config/NuGet.Config', '-OutputDirectory', localRepoDir];
    const spawnOptions = { 
      stdio:  ['pipe', 'pipe', 'pipe']
    , env: process.env }; 

    spawn(command, args, spawnOptions)
    .stdio[1]
    .on('end', () => {
      /* opts.repoDb.find({}, (_err, docs) => {
        if (_err) {
          opts.log.write(_err.message);
        }
        console.log(`Updating ${docs.length} dependencies`);
        readArray(docs)
          //.pipe(map(licenseStream(opts)))
          //.pipe(map(repoDbStream(opts)))
          //.pipe(map(logStream(opts)))
          .on('end', () => {
            updateScope(opts, (opts2) => {
              opts.repoDb.persistence.compactDatafile();
              (opts.repoDb as any).on('compaction.done', () => {
                report(opts, () => {
                  opts.log.close();
                  console.log(`${green('( done )')}: ${underline(opts.reportPath)}`);
                  process.exit(0);
                });
              });
            });
          })
          .pipe(process.stdout);
      }); */
    })
    .pipe(split())
    .pipe(map(dependencyStream(opts)))
    .pipe(map(nuspecStream(opts)))
    .pipe(map(repodbStream(opts)))
    .pipe(map(logStream(opts)))
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
