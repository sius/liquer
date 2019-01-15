exports.command = 'nuget <command>';
exports.description = 'Nuget specific commands...\nSee also: lq nuget --help';
exports.builder = (yargs) => {
  return yargs.commandDir('../../dm/nuget/cmds').help('help')
    .option('debug-report', {
        describe: 'Generate debug report'
      , type: 'boolean'
      , group: 'Reporter Options:'
      , default: false
    })
};

exports.handler = (argv) => { };
