#!/usr/bin/env node
const argv = require('yargs');
argv
  .option('file', {
    alias: ['f','inpit','i'],
    describe: `The input file`,
    default: 'pom.xml'
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
  .command(require('./cmds/mvn'))
  .demandCommand()
  .wrap(100)
  .epilog('More informations about dependency-audit: https://github.com/sius/dependency-audit')
  .example('daudit mvn', `Download Maven dependencies to go offline and create a License report`)
  .example('daudit mvn -f pom.xml', `Download Maven dependencies to go offline and create a License report`)
  .argv;
