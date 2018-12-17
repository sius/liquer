exports.command  = 'doctor <command>';
exports.describe = 'Sanitize, update and configure, see: liq doctor --help';
exports.builder = (yargs) => yargs.commandDir('doctor').help();
