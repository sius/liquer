const { resolve } = require('path')
  , { ensureDir } = require('fs-extra')
  , colors = require('chalk')
  , Datasource = require('nedb')
  , Reporter = require('../../../lib/reporter');


exports.command  = 'report';
exports.describe = `Generate the report files from the specified repo.db file\nSee also: lq mvn report --help`;
exports.builder = (yargs) => {
  return yargs.option('db-file', {
    alias: 'f',
    describe: 'Path to the repo.db file',
    type: 'string',
    default: 'repo.db',
    coerce: resolve
  }).option('working-directory', {
    alias: 'd',
    describe: 'Optional output dircetory',
    default: '.'
  }).help('help')
};

exports.handler  = (argv) => {
  const cwd = resolve(argv.d);
  ensureDir(cwd, (err) => {
    if (err) {
      console.error(err);
      process.exit(-1);
    } else {
      console.log(colors.green('create reports'));
      const repoDb = new Datasource({ filename: argv.f, autoload: true });
      const reporterPath = resolve(__dirname, '../reporter');
      const templatePath = resolve(__dirname, '../reporter/views');
      const options = { repoDb, cwd, reporterPath, templatePath };
      const report = Reporter.report(options);
      report().then(() => {
        console.log(colors.green('done'));
        process.exit(0);
      });
    }
  })
};
