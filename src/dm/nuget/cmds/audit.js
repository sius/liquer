const os = require('os')
  , { resolve } = require('path')
  , { audit } = require('../audit');

const nuget = (/^Windows_NT/.test(os.type())) ? 'nuget' : 'nuget'

function getDefaultConfigFile() {
  if (/^Windows_NT/.test(os.type())) {
    return `${os.homedir}\AppData\Roaming\NuGet\NuGet.config`;
  } else {
    return `${os.homedir}/.nuget/NuGet/NuGet.Config`;
  }
}

exports.command = 'audit [options]';
exports.describe = 'Audit nuget dependencies to go offline:\n- Split run-/buildtime dependencies.\n- Retrieve licenses, vulnarabilities and approve usage.\n- Generate human friendly reports.\nSee also: lq nuget audit --help';
exports.builder = (yargs) => {
  return yargs.help('help')

    // Options:
    .option('command', {
        describe: `The nuget command. Default is 'nuget' but could be 'mono nuget' on linux or macOS`
      , type: 'string'
      , default: nuget
    }).option('packages-config', {
        alias: ['file', 'f']
      , describe: 'Path to your packages.config file'
      , type: 'string'
      , default: './packages.config'
    }).option('log', {
        alias: 'o'
      , describe: 'The log output file name'
      , default: 'nuget.log'
    }).option('working-directory', {
        alias: 'd'
      , describe: 'The working directory name.'
      , type: 'string'
      , default: 'audit/nuget'
    })

    // Nuget options:
    .option('ConfigFile', {
        describe: 'The NuGet configuration file.'
      , type: 'string'
      , default: getDefaultConfigFile()
      , group: 'Nuget options:'
    }).option('Framework', {
        describe: `Target framework used for selecting dependencies. Defaults to 'Any' if not specified.`
      , type: 'string'
      , default: 'Any'
      , group: 'Nuget options:'
    }).option('Prerelease', {
        describe: 'Allows prerelease packages to be installed. This flag is not required when restoring packages by installing from packages.config.'
      , type: 'boolean'
      , default: false
      , group: 'Nuget options:'
    }).options('Source', {
        describe: `A list of packages sources to use for this command.`
      , type: 'string'
      , default: ''
      , group: 'Nuget options:'
    }).options('FallbackSource', {
        describe: `A list of package sources to use as fallbacks for this command.`
      , type: 'string'
      , default: ''
      , group: 'Nuget options:'
    })
    
    // Audit options:
    .option('xray', {
        describe: 'Xray Credentials'
      , hidden: true
      , type: 'object'
      , default: false
    }).option('xray-audit', {
        alias: 'X'
      , describe: 'Enable Xray Audit (Credentials required)'
      , type: 'boolean'
      , group: 'Audit Options:'
      , default: false});
};

exports.handler = (argv) => {
  const options = { 
      ...argv
    , reporterPath: resolve(__dirname, '../reporter')
    , templatePath: resolve(__dirname, '../reporter/views')
  }
  audit(options);
};
