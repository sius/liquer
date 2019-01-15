exports.command = 'npm <command>';
exports.description = 'Npm specific commands...\nSee also: lq npm --help';
exports.builder = (yargs) => {
  return yargs.commandDir('../../dm/npm/cmds').help('help')
    .option('debug-report', {
        describe: 'Generate debug report'
      , type: 'boolean'
      , group: 'Reporter Options:'
      , default: false
    });
};

exports.handler = (argv) => { };
