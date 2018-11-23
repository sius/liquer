import { resolve } from 'path';
import { audit } from '../../mvn/audit';
import { MavenOptions } from '../../mvn/maven-options';

exports.command  = 'audit';
exports.aliases = ['a'];
exports.describe = 'Start the dependency audit.';
exports.handler =  (argv) => {
  const options: MavenOptions = {
    file: resolve(__dirname, argv.file),
    goal: 'dependency:go-offline'
  };
  audit(options);
};
