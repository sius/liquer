exports.command = 'login <endpoint>';
exports.description = `login to an endpoint\nSee also: lq login --help`;
exports.builder = (yargs) => {
  return yargs
    .commandDir('login')
    .help('help')
    .option('username', {
        alias: 'u'
      , describe: 'username'
      , type: 'string'
      , group: 'Credentials:'
    })
    .option('password', {
        alias: 'p'
      , describe: 'password'
      , type: 'string'
      , group: 'Credentials:'
    })
}
exports.handler = (argv) => { };
