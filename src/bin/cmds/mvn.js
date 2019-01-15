exports.command = 'mvn <command>';
exports.description = `Maven specific commands...\nSee also: lq mvn --help`;
exports.builder = (yargs) => {
  return yargs.commandDir('../../dm/mvn/cmds').help('help')
    .option('debug-report', {
        describe: 'Generate debug report'
      , type: 'boolean'
      , group: 'Reporter Options:'
      , default: false
    });
};
exports.handler = (argv) => { };
