import { join, parse, resolve } from 'path';
import { ensureDir } from 'fs-extra';
import { green } from 'colors';
import { REPORT_OPTIONS_GROUP } from '../../shared';
import { Reporter, ReporterOptions } from '../../../lib/reporter';
import * as Datasource from 'nedb';

exports.command  = 'report <repoDb> [options]';
exports.describe = 'Generate report files from the repoDb file, see: liq mvn report --help';
exports.builder = (yargs) => {
  return yargs.positional('repoDb', {
        describe: 'Path to the repo.db file'
      , default: './reop.db'
      , coerce: resolve
    })
    .help()
    .option('working-dir', {
        alias: 'd'
      , describe: ''
      , default: 'reports'
      , group: REPORT_OPTIONS_GROUP
    })
    .option('local-repo', {
        alias: 'l'
      , describe: 'The Maven local repo dirname'
      , default: 'repo'
      , group: REPORT_OPTIONS_GROUP
    });
};
exports.handler = (argv) => {
  const wd = argv.workingDir;
  /* onst options: AuditOptions = {
    file: argv.file,
    reportFile: argv.report,
    goal: 'dependency:go-offline'
  } */
  ensureDir(wd, (err) => {
    if (err) {
      console.error(err);
      process.exit(-1);
    } else {
      console.log(green('creating reports'));
      const scanPath = parse(argv.repoDb).dir;
      const localRepo = join(scanPath, argv.localRepo);
      const pom = join(scanPath, 'pom.xml');
      const repoDb = new Datasource({ filename: argv.repoDb, autoload: true });
      const options: ReporterOptions = { repoDb, scanPath, localRepo, pom };

      const r = new Reporter(options);
      r.report().then( () => process.exit(0));

    }
  });
};
