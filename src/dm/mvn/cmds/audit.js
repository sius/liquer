const { audit } = require('../audit')
  , { resolve } = require('path')
  , os = require('os');

const mvn = (/^Windows_NT/.test(os.type())) ? 'mvn.cmd' : 'mvn'

exports.command = 'audit [options]';
exports.describe = 'Audit maven dependencies to go offline:\n- Split run-/buildtime dependencies. Detect BOM files.\n- Retrieve licenses, vulnarabilities and approve usage.\n- Generate human friendly reports.\nSee also: lq mvn audit --help';
exports.builder = (yargs) => {

  return yargs.help('help')
    .option('command', {
      describe: `The mvn command.`
    , type: 'string'
    , default: mvn
  }).option('pom-file', {
      alias: ['file', 'f']
    , describe: 'Path to the pom file (pom.xml)'
    , type: 'string'
    , default: 'pom.xml'
  }).option('log', {
      alias: 'o'
    , describe: 'The output file name'
    , default: 'log.txt'
  }).option('working-directory', {
      alias: 'd'
    , describe: 'The working directory name.'
    , default: 'audit/mvn'
  }).option('extract-files', {
      alias: 'e'
    , describe: 'If true unzip jars and extract maven standard layout text files (LICENSE.txt, NOTICE.txt, README.txt ...) to extracted-dir'
    , type: 'boolean'
    , default: true
  }).option('extracted-dir', {
      alias: 'x'
    , describe: 'The extracted directory name'
    , default: 'ext'
  })
  
  // Maven options:
  .option('local-repo', {
    alias: 'l',
    describe: `The Maven localRepo dirname`,
    default: 'repo',
    group: 'Maven Options:'
  }).option('remote-repo', {
    alias: 'r',
    describe: 'The Maven remoteRepo URL',
    default: 'https://repo.maven.apache.org/maven2',
    group: 'Maven Options:'
  }).option('settings', {
    alias: 's',
    describe: 'The path to the Maven settings.xml.',
    default: resolve(os.homedir(), '.m2', 'settings.xml'),
    group: 'Maven Options:'
  }).option('profile', {
    alias: 'P',
    describe: 'The Maven profile to use',
    group: 'Maven Options:'
  })
  
  // Audit options:
  .option('xray', {
    describe: 'Xray Credentials'
  , hidden: true
  , type: 'object'
  }).option('artifactory', {
    describe: 'Artifactory Credentials'
  , hidden: true
  , type: 'object'
  }).option('xray-audit', {
    alias: 'X'
  , describe: 'Enable Xray Audit (READ Permissions required)'
  , type: 'boolean'
  , group: 'Audit options:'
  , default: false
  }).option('artifactory-audit', {
    alias: 'A'
  , describe: 'Enable Artifactory Audit (READ Permissions required)'
  , type: 'boolean'
  , group: 'Audit options:'
  , default: false});
};

exports.handler  = (argv) => {

  const options = {
      command: argv.command
    , workingDirectory: argv.workingDirectory
    , file: argv.file
    , settings: argv.settings
    , remoteRepo: argv.remoteRepo
    , profile: argv.profile
    , logFile: argv.log
    , extractFiles: argv.extractFiles
    , extractedDir: argv.extractedDir
    , reporterPath: resolve(__dirname, '../reporter')
    , templatePath: resolve(__dirname, '../reporter/views')
  }
  if (argv.xrayAudit && argv.xray && argv.xray.credentials) {
    options.xrayCredentials = argv.xray;
  }
  if (argv.artifactoryAudit && argv.artifactory && argv.artifactory.credentials) {
    options.artifactoryCredentials = argv.artifactory;
  }

  audit(options);

};
