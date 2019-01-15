#!/usr/bin/env node
const argv = require('yargs')
  , config = require('./config').rc();
  
argv
  .config(config)
  .usage('lq <command> [args]')
  .help('help')
  .command(require('./cmds/mvn'))
  .command(require('./cmds/npm'))
  .command(require('./cmds/nuget'))
  .command(require('./cmds/login'))
  .wrap(100)
  .epilog(`You find more information about liquer-cli in the README at`)
  .example('lq update security', 'Export/Update the security database')
  .example('lq mvn audit', 'Get the Maven dependencies to go offline.')
  .example('lq mvn audit pom-xyz.xml -s custom-settings.xml', 'Get the Maven dependencies to go offline.')
  .example('lq mvn report -f path/to/repo.db', 'Get the liquer reports from the repo.db file.')
  .example(`lq npm audit`, 'Get the Npm dependencies to go offline.')                                
  .example(`lq npm report -f path/to/repo.db -d reports`, 'Get the liquer reports from the repo.db file.')                                
  .argv;
