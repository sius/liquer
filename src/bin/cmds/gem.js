exports.command = 'gem <command>';
exports.description = 'Gem specific commands...\nSee also: lq gem --help';
exports.builder = (yargs) => {
  return yargs.commandDir('../../dm/gem/cmds').help('help')
    .option('debug-report', {
        describe: 'Generate debug report'
      , type: 'boolean'
      , group: 'Reporter Options:'
      , default: false
    })
    .option('xray-audit', {
        aliay: 'X'
      , describe: 'Enable Xray Audit (READ Permissions required)'
      , type: 'boolean'
      , group: 'Audit Options:'
      , default: false
    });
};

exports.handler = (argv) => { };
