const { audit } = require('../audit')
  , { resolve } = require('path')
  , os = require('os');

const npm = (/^Windows_NT/.test(os.type())) ? 'npm.cmd' : 'npm'

exports.command = 'audit [options]';
exports.describe = 'Audit npm dependencies to go offline:\n- Split run-/buildtime dependencies.\n- Retrieve licenses, vulnarabilities and approve usage.\n- Generate human friendly reports.\nSee also: lq npm audit --help';
exports.builder = (yargs) => {
  return yargs.help('help')

    // Options:
    .option('command', {
        describe: `The npm command.`
      , type: 'string'
      , default: npm
    }).option('package', {
        alias: ['folder', 'f']
      , describe: 'Path to the package folder with your package.json file'
      , type: 'string'
      , default: ''
    }).option('log', {
        alias: 'o'
      , describe: 'The output file name'
      , default: 'log.txt'
    }).option('working-directory', {
        alias: 'd'
      , describe: 'The working directory name.'
      , default: 'audit/npm'
    })
    
    // Audit options:
    .option('xray', {
        describe: 'Xray Credentials'
      , hidden: true
      , type: 'object'
      , default: false
    }).option('xray-audit', {
        alias: 'X'
      , describe: 'Enable Xray Audit (READ Permissions required)'
      , type: 'boolean'
      , group: 'Audit Options:'
      , default: false});
};
exports.handler = (argv) => {
  const options = {
      command: argv.command
    , package: argv.package
    , workingDirectory: argv.workingDirectory
    , logFile: argv.log
    , reporterPath: resolve(__dirname, '../reporter')
    , templatePath: resolve(__dirname, '../reporter/views')
  }
  if (argv.xrayAudit && argv.xray && argv.xray.credentials) {
    options.xrayCredentials = argv.xray;
  }
  audit(options);

};
