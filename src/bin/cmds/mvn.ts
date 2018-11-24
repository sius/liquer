import { resolve } from 'path';
import { audit } from '../../mvn/audit';
import { MavenOptions } from '../../mvn/maven-options';

exports.command  = 'mvn';
exports.aliases = ['maven'];
exports.describe = 'Download Maven dependencies and create a License report';
exports.handler =  (argv) => {
  const options: MavenOptions = {
    file: argv.file,
    reportFile: argv.report,
    goal: 'dependency:go-offline'
  };
  audit(options);
};
