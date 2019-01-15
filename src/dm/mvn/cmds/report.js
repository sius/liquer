const { resolve, join, parse } = require('path')
  , { ensureDir } = require('fs-extra')
  , { green } = require('chalk')
  , Reporter = require('../../../lib/reporter')
  , Datasource = require('nedb'); 

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
    default: 'reports'
  }).option('local-repo', {
    alias: 'l',
    describe: `The Maven localRepo dirname`,
    default: 'repo',
    group: 'Maven Options:',
  }).help('help')
};

exports.handler  = (argv) => {
  const scanPath = resolve(argv.d);
  ensureDir(scanPath, (err) => {
    if (err) {
      console.error(err);
      process.exit(-1);
    } else {
      console.log(green('FKA create reports'));
      const dir = parse(argv.f).dir;
      const localRepo = join(dir, argv.localRepo) ;
      const pom = join(dir, 'pom.xml');
      const repoDb = new Datasource({ filename: argv.f, autoload: true });
      const reporterPath = resolve(__dirname, '../../../dm/mvn/reporter');
      const templatePath = resolve(__dirname, '../../../dm/mvn/reporter/views');
      const options = { repoDb, scanPath, localRepo, pom, reporterPath, templatePath };
      const report = Reporter.report(options);
  
      report().then(() => {
        console.log(green('done'));
        process.exit(0);
      });
    }
  })
};
