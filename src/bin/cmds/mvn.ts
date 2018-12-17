exports.command  = 'mvn <command>';
exports.describe = 'Maven commands, see: liq mvn --help';
exports.builder = (yargs) => yargs.commandDir('mvn').help();
