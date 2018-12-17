#!/usr/bin/env node
const argv = require('yargs')
  , findUp = require('find-up')
  , fs = require('fs')
  , configPath = findUp.sync(['.liq', '.liq.json'])
  , config = configPath ? JSON.parse(fs.readFileSync(configPath)) : {}
argv
  .config(config)
  .usage('liq <command> [args]')
  .help('help')
  .option('log-file', {
      alias: 'l'
    , describe: `log file.`
    , default: 'log.txt'
    , type: 'string'
  })
  .demandCommand()
  .command(require('./cmds/doctor'))
  .command(require('./cmds/mvn'))
  //.commandDir('cmds')
  .wrap(100)
  .epilog(`DON'T DRINK AND DRIVE!\nDo not use un- or intentionally unauthorized dependencies that could harm your business!\nMore informations about liquer see: https://liquer.io`)
  .example(`liq doctor`, `Test your installation`)
  .example(`liq mvn audit`, `Retrieve the Maven dependencies to go offline`)
  .argv;
