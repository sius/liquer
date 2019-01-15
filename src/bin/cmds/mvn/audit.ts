import { resolve } from 'path';
import { homedir } from 'os';
import { exists } from 'fs';
import { AUDIT_OPTIONS_GROUP, MAVEN_OPTIONS_GROUP } from '../../shared';
// import { Doctor, DoctorOptions } from '../../../lib/doctor';
import { audit } from '../../../mvn/audit';
import { AuditOptions } from '../../../mvn/audit-options';

exports.command  = 'audit <file> [options]';
exports.describe = 'Download Maven dependencies to go offline and create a License report';
exports.builder = (yargs: any) => {
  return yargs.positional('file', {
      describe: 'Path to the POM file (pom.xml)'
    , type: 'string'
    , default: './pom.xml'
    , group: MAVEN_OPTIONS_GROUP
  })
  .option('local-repo', {
      alias: ['l']
    , describe: `The Maven localRepo dirname`
    , default: 'repo'
    , group: MAVEN_OPTIONS_GROUP
  })
  .option('remote-repo', {
      alias: ['r']
    , describe: `The Maven remoteRepo URL`
    , default: ''
    , group: MAVEN_OPTIONS_GROUP
  })
  .option('settings', {
      alias: 's'
    , describe: 'Custom Maven settings path'
    , default: resolve(homedir(), '.m2', 'settings.xml')
    , group: MAVEN_OPTIONS_GROUP
  })
  .option('profile', {
      alias: 'P'
    , describe: 'The maven profile to use'
    , group: MAVEN_OPTIONS_GROUP
  })
  .option('working-dir', {
      alias: 'd'
    , describe: 'The working directory name'
    , default: 'audit'
  })
  .option('ext-txt-files', {
      alias: 'e'
    , describe: 'If true unzip artifacts and extract maven standard layout text files (LICENSE, NOTICE, DEPENDENCIES, README) to the ext folder.'
    , type: 'boolean'
    , defaiult: true
  })
  .option('ext-dir', {
      alias: 'x'
    , describe: 'The extracted dir name'
    , group: AUDIT_OPTIONS_GROUP
    , default: 'ext'
  });
};
exports.handler =  (argv: any) => {

  exists(argv.settings, (_exists: boolean) => {

    const options: AuditOptions = {
        workingDir: argv.workingDir
      , file: argv.file
      , settings: _exists ? argv.settings : null
      // , remoteRepo: argv.remoteRepo
      // , profile: argv.profile
      // , logFile: argv. log
      // , extTxtFiles: argv.extTxtFiles
      // , extDir: argv extDir

      , reportFile: 'report.txt'

      , goal: 'dependency:go-offline'
    };
    // const doc = new Doctor();

    audit(options);

  });

};
