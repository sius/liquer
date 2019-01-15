exports.command = 'pip <command>';
exports.description = 'Pip specific commands...\nSee also: lq pip --help';
exports.builder = (yargs) => {
  return yargs.commandDir('../../dm/pip/cmds').help('help')
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
