#!/usr/bin/env node

let argv = require('yargs')
  , path = require('path');

argv
  .option('file', {
    alias: ['f','inpit','i'],
    describe: `The input file`,
  })
  .option('settings', {
    alias: ['s', 'config', 'c'],
    describe: `settings/configuration file`,
  })
  .option('output', {
    alias: ['o'],
    describe: `The log output file.`,
    default: 'log.txt'
  })
  .option('report', {
    alias: ['r'],
    describe: `The report file.`,
    default: 'report.txt'
  })
  .help('help')
  //.coerce(['schema', 'json-schema-faker', 'output'], path.resolve)
  .command(require('./cmds/audit'))
  .demandCommand()
  .wrap(100)
  .epilog('For more information about dependency-audit, find out README at https://github.com/sius/dependency-audit')
  .example('dpd audit -f pom.xml', `Download dependencies to go offline and retrieve license information`)
  .argv;
